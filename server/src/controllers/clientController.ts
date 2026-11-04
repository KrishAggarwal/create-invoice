import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param || '';
}

export async function getClients(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const clients = await prisma.client.findMany({
      where: { workspaceId: req.workspaceId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  } catch (error) {
    console.error('getClients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients.' });
  }
}

export async function createClient(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, companyName, email, phone, address, taxId, currency, notes } = req.body;

    if (!name && !companyName) {
      res.status(400).json({ error: 'Client name or company name is required.' });
      return;
    }

    const client = await prisma.client.create({
      data: {
        workspaceId: req.workspaceId!,
        name: name || companyName,
        companyName,
        email,
        phone,
        address,
        taxId,
        currency,
        notes,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('createClient error:', error);
    res.status(500).json({ error: 'Failed to create client.' });
  }
}

export async function updateClient(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const uuid = getParam(req.params.id);
    const { name, companyName, email, phone, address, taxId, currency, notes } = req.body;

    const existing = await prisma.client.findFirst({
      where: { uuid, workspaceId: req.workspaceId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Client not found.' });
      return;
    }

    const updated = await prisma.client.update({
      where: { id: existing.id },
      data: {
        name,
        companyName,
        email,
        phone,
        address,
        taxId,
        currency,
        notes,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('updateClient error:', error);
    res.status(500).json({ error: 'Failed to update client.' });
  }
}

export async function deleteClient(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const uuid = getParam(req.params.id);

    const existing = await prisma.client.findFirst({
      where: { uuid, workspaceId: req.workspaceId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Client not found.' });
      return;
    }

    await prisma.client.delete({ where: { id: existing.id } });
    res.json({ success: true, message: 'Client deleted.' });
  } catch (error) {
    console.error('deleteClient error:', error);
    res.status(500).json({ error: 'Failed to delete client.' });
  }
}
