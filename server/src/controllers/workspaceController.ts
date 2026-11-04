import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getWorkspace(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.workspaceId },
    });

    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found.' });
      return;
    }

    res.json(workspace);
  } catch (error) {
    console.error('getWorkspace error:', error);
    res.status(500).json({ error: 'Failed to retrieve workspace.' });
  }
}

export async function updateWorkspace(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      name,
      entityType,
      legalName,
      taxId,
      logoUrl,
      defaultCurrency,
      address,
      phone,
      email,
      title,
    } = req.body;

    const updated = await prisma.workspace.update({
      where: { id: req.workspaceId },
      data: {
        ...(name !== undefined && { name }),
        ...(entityType !== undefined && { entityType }),
        ...(legalName !== undefined && { legalName }),
        ...(taxId !== undefined && { taxId }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(defaultCurrency !== undefined && { defaultCurrency }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(title !== undefined && { title }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('updateWorkspace error:', error);
    res.status(500).json({ error: 'Failed to update workspace.' });
  }
}

