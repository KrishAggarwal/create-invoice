import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    uuid: string;
    email: string;
    fullName: string;
  };
  workspaceId?: number;
  workspaceUuid?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'dev_invoice_saas_secret_key_sde_2026_super_secure';

    const decoded = jwt.verify(token, secret) as {
      userId?: number;
      userUuid?: string;
      email: string;
      fullName?: string;
      workspaceId?: number;
      workspaceUuid?: string;
    };

    // Fast-path: Cryptographically verified JWT contains identity claims directly
    if (decoded.userId && decoded.workspaceId && decoded.userUuid) {
      req.user = {
        id: decoded.userId,
        uuid: decoded.userUuid,
        email: decoded.email,
        fullName: decoded.fullName || '',
      };
      req.workspaceId = decoded.workspaceId;
      req.workspaceUuid = decoded.workspaceUuid;
      return next();
    }

    // Fallback for legacy tokens without embedded workspaceId
    const userIdentifier = decoded.userUuid || (decoded as any).userId;

    if (!userIdentifier) {
      res.status(401).json({ error: 'Invalid token payload.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { uuid: userIdentifier },
      select: { id: true, uuid: true, email: true, fullName: true },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found or session expired.' });
      return;
    }

    req.user = user;

    // Check workspace header or pick first active workspace
    const customWorkspaceUuid = req.headers['x-workspace-id'] as string | undefined;

    let membership;
    if (customWorkspaceUuid) {
      const targetWorkspace = await prisma.workspace.findUnique({
        where: { uuid: customWorkspaceUuid },
        select: { id: true, uuid: true },
      });
      if (targetWorkspace) {
        membership = await prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: targetWorkspace.id,
              userId: user.id,
            },
          },
          include: { workspace: true },
        });
      }
    }

    if (!membership) {
      membership = await prisma.workspaceMember.findFirst({
        where: { userId: user.id },
        include: { workspace: true },
      });
    }

    if (!membership) {
      // Auto-create a default personal workspace if none exists
      const newWorkspace = await prisma.workspace.create({
        data: {
          name: `${user.fullName}'s Workspace`,
          entityType: 'individual',
          members: {
            create: {
              userId: user.id,
              role: 'owner',
            },
          },
        },
      });
      req.workspaceId = newWorkspace.id;
      req.workspaceUuid = newWorkspace.uuid;
    } else {
      req.workspaceId = membership.workspace.id;
      req.workspaceUuid = membership.workspace.uuid;
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
