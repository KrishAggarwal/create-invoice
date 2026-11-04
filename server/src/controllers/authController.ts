import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_invoice_saas_secret_key_sde_2026_super_secure';

function createToken(
  userId: number,
  userUuid: string,
  email: string,
  fullName: string,
  workspaceId: number,
  workspaceUuid: string
) {
  return jwt.sign(
    { userId, userUuid, email, fullName, workspaceId, workspaceUuid },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export async function register(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { email, password, fullName, phone, workspaceName, entityType } = req.body;

    if (!email || !password || !fullName || !phone) {
      res.status(400).json({ error: 'Full name, email, phone number, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(400).json({ error: 'A user with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName: fullName.trim(),
        phone: cleanPhone,
        memberships: {
          create: {
            role: 'owner',
            workspace: {
              create: {
                name: workspaceName?.trim() || `${fullName.trim()}'s Studio`,
                entityType: entityType === 'agency' ? 'agency' : 'individual',
                email: normalizedEmail,
                phone: cleanPhone,
              },
            },
          },
        },
      },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    const activeWorkspace = user.memberships[0].workspace;
    const token = createToken(
      user.id,
      user.uuid,
      user.email,
      user.fullName,
      activeWorkspace.id,
      activeWorkspace.uuid
    );

    res.status(201).json({
      token,
      user: {
        uuid: user.uuid,
        email: user.email,
        fullName: user.fullName,
      },
      workspace: activeWorkspace,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

export async function login(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const activeWorkspace = user.memberships[0]?.workspace || null;
    const token = createToken(
      user.id,
      user.uuid,
      user.email,
      user.fullName,
      activeWorkspace ? activeWorkspace.id : 0,
      activeWorkspace ? activeWorkspace.uuid : ''
    );

    res.json({
      token,
      user: {
        uuid: user.uuid,
        email: user.email,
        fullName: user.fullName,
      },
      workspace: activeWorkspace,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const activeWorkspace =
      user.memberships.find((m) => m.workspaceId === req.workspaceId)?.workspace ||
      user.memberships[0]?.workspace;

    res.json({
      user: {
        uuid: user.uuid,
        email: user.email,
        fullName: user.fullName,
      },
      workspace: activeWorkspace,
      workspaces: user.memberships.map((m) => m.workspace),
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
}
