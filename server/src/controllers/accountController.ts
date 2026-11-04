import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param || '';
}

export async function getAccounts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const accounts = await prisma.paymentAccount.findMany({
      where: { workspaceId: req.workspaceId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(accounts);
  } catch (error) {
    console.error('getAccounts error:', error);
    res.status(500).json({ error: 'Failed to fetch accounts.' });
  }
}

export async function createAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { label, type, bankName, accountNumber, routingOrIfsc, upiId, swiftBic, isDefault } =
      req.body;

    if (!label) {
      res.status(400).json({ error: 'Account label is required.' });
      return;
    }

    if (isDefault) {
      await prisma.paymentAccount.updateMany({
        where: { workspaceId: req.workspaceId },
        data: { isDefault: false },
      });
    }

    const account = await prisma.paymentAccount.create({
      data: {
        workspaceId: req.workspaceId!,
        label,
        type: type || 'bank',
        bankName,
        accountNumber,
        routingOrIfsc,
        upiId,
        swiftBic,
        isDefault: Boolean(isDefault),
      },
    });

    res.status(201).json(account);
  } catch (error) {
    console.error('createAccount error:', error);
    res.status(500).json({ error: 'Failed to create payment account.' });
  }
}

export async function updateAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const uuid = getParam(req.params.id);
    const { label, type, bankName, accountNumber, routingOrIfsc, upiId, swiftBic, isDefault } =
      req.body;

    const existing = await prisma.paymentAccount.findFirst({
      where: { uuid, workspaceId: req.workspaceId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Payment account not found.' });
      return;
    }

    if (isDefault) {
      await prisma.paymentAccount.updateMany({
        where: { workspaceId: req.workspaceId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.paymentAccount.update({
      where: { id: existing.id },
      data: {
        label,
        type,
        bankName,
        accountNumber,
        routingOrIfsc,
        upiId,
        swiftBic,
        ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('updateAccount error:', error);
    res.status(500).json({ error: 'Failed to update payment account.' });
  }
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const uuid = getParam(req.params.id);

    const existing = await prisma.paymentAccount.findFirst({
      where: { uuid, workspaceId: req.workspaceId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Payment account not found.' });
      return;
    }

    await prisma.paymentAccount.delete({ where: { id: existing.id } });
    res.json({ success: true, message: 'Payment account deleted.' });
  } catch (error) {
    console.error('deleteAccount error:', error);
    res.status(500).json({ error: 'Failed to delete payment account.' });
  }
}
