import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  return param || '';
}

interface LineItemInput {
  title: string;
  subtitle?: string;
  hours?: number;
  rate?: number;
  amount: number;
}

/**
 * Resolves an existing client by UUID or harvests a new client record.
 */
async function resolveClientId(
  workspaceId: number,
  providedClientUuid?: string,
  clientSnapshot?: any,
  tx: any = prisma
): Promise<number | null> {
  if (providedClientUuid) {
    const existingByUuid = await tx.client.findFirst({
      where: { uuid: providedClientUuid, workspaceId },
    });
    if (existingByUuid) return existingByUuid.id;
  }
  if (!clientSnapshot) return null;

  const lookupName = (clientSnapshot.name || clientSnapshot.companyName || '').trim();
  const lookupEmail = (clientSnapshot.email || '').trim().toLowerCase();
  if (!lookupName && !lookupEmail) return null;

  const conditions: any[] = [];
  if (lookupName) {
    conditions.push({ name: { equals: lookupName, mode: 'insensitive' } });
    conditions.push({ companyName: { equals: lookupName, mode: 'insensitive' } });
  }
  if (lookupEmail) {
    conditions.push({ email: { equals: lookupEmail, mode: 'insensitive' } });
  }

  const existing = await tx.client.findFirst({
    where: {
      workspaceId,
      OR: conditions,
    },
  });

  if (existing) {
    return existing.id;
  }

  const created = await tx.client.create({
    data: {
      workspaceId,
      name: clientSnapshot.name || clientSnapshot.companyName || 'Unnamed Client',
      companyName: clientSnapshot.companyName || null,
      email: clientSnapshot.email || null,
      phone: clientSnapshot.phone || null,
      address: clientSnapshot.address || null,
      taxId: clientSnapshot.taxId || null,
    },
  });

  return created.id;
}

/**
 * Resolves an existing payment account or automatically harvests a new payment account record.
 */
async function resolvePaymentAccountId(
  workspaceId: number,
  providedAccountUuid?: string,
  accountSnapshot?: any,
  tx: any = prisma
): Promise<number | null> {
  if (providedAccountUuid) {
    const existingByUuid = await tx.paymentAccount.findFirst({
      where: { uuid: providedAccountUuid, workspaceId },
    });
    if (existingByUuid) return existingByUuid.id;
  }
  if (!accountSnapshot) return null;

  const acctNum = (accountSnapshot.accountNumber || '').trim();
  const upi = (accountSnapshot.upiId || '').trim();
  const bankName = (accountSnapshot.bankName || '').trim();

  if (!acctNum && !upi && !bankName) return null;

  const conditions: any[] = [];
  if (acctNum) {
    conditions.push({ accountNumber: { equals: acctNum, mode: 'insensitive' } });
  }
  if (upi) {
    conditions.push({ upiId: { equals: upi, mode: 'insensitive' } });
  }

  let existing = null;
  if (conditions.length > 0) {
    existing = await tx.paymentAccount.findFirst({
      where: {
        workspaceId,
        OR: conditions,
      },
    });
  }

  if (existing) {
    return existing.id;
  }

  const label =
    accountSnapshot.label?.trim() ||
    bankName ||
    (upi ? 'UPI' : 'Bank Account');

  const created = await tx.paymentAccount.create({
    data: {
      workspaceId,
      label,
      type: accountSnapshot.type || 'bank',
      bankName: bankName || null,
      accountNumber: acctNum || null,
      routingOrIfsc: accountSnapshot.routingOrIfsc?.trim() || null,
      upiId: upi || null,
      swiftBic: accountSnapshot.swiftBic?.trim() || null,
      isDefault: false,
    },
  });

  return created.id;
}

export async function getInvoices(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status, type, search } = req.query;

    const where: any = {
      workspaceId: req.workspaceId,
    };

    if (status && typeof status === 'string' && status !== 'all') {
      where.status = status;
    }

    if (type && typeof type === 'string' && type !== 'all') {
      where.type = type;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { client: { companyName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: true,
        lineItems: { orderBy: { sortOrder: 'asc' } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
      orderBy: { invoiceDate: 'desc' },
    });

    res.json(invoices);
  } catch (error) {
    console.error('getInvoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices.' });
  }
}

export async function getInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const uuid = getParam(req.params.id);

    const invoice = await prisma.invoice.findFirst({
      where: {
        uuid,
        workspaceId: req.workspaceId,
      },
      include: {
        client: true,
        paymentAccount: true,
        lineItems: { orderBy: { sortOrder: 'asc' } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }

    res.json(invoice);
  } catch (error) {
    console.error('getInvoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice.' });
  }
}

export async function createInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      servicePeriod,
      servicePeriodStart,
      servicePeriodEnd,
      type = 'due',
      billingMode = 'fixed',
      template = 'minimal',
      currency = 'USD',
      discount = 0,
      discountType = 'percentage',
      taxRate = 0,
      notes = '',
      paymentTerms = 'Net 15',
      clientId,
      clientUuid,
      paymentAccountId,
      paymentAccountUuid,
      senderSnapshot,
      clientSnapshot,
      accountSnapshot,
      lineItems = [],
      initialPayment,
    } = req.body;

    if (!invoiceNumber) {
      res.status(400).json({ error: 'Invoice number is required.' });
      return;
    }

    const workspaceId = req.workspaceId!;

    const invoice = await prisma.$transaction(async (tx) => {
      // 1. Auto-harvest or resolve client
      const targetClientUuid = clientUuid || clientId;
      const resolvedClientId = await resolveClientId(workspaceId, targetClientUuid, clientSnapshot, tx);

      // 2. Auto-harvest or resolve payment account
      const targetAccountUuid = paymentAccountUuid || paymentAccountId;
      const resolvedPaymentAccountId = await resolvePaymentAccountId(
        workspaceId,
        targetAccountUuid,
        accountSnapshot,
        tx
      );

      // 3. Calculate subtotal and line items
      const parsedLineItems = (lineItems as LineItemInput[]).map((item, idx) => {
        let amount = Number(item.amount) || 0;
        const hours = Number(item.hours) || 0;
        const rate = Number(item.rate) || 0;
        if (billingMode === 'hourly' && hours > 0 && rate > 0) {
          amount = hours * rate;
        }
        return {
          title: item.title || '',
          subtitle: item.subtitle || '',
          hours,
          rate,
          amount,
          sortOrder: idx,
        };
      });

      const subtotal = parsedLineItems.reduce((acc, it) => acc + it.amount, 0);

      // Calculate discount
      const discVal = Number(discount) || 0;
      const discountAmount =
        discountType === 'percentage' ? (subtotal * discVal) / 100 : discVal;
      const afterDiscount = Math.max(0, subtotal - discountAmount);

      // Calculate tax
      const taxVal = Number(taxRate) || 0;
      const taxAmount = (afterDiscount * taxVal) / 100;
      const totalAmount = afterDiscount + taxAmount;

      // Handle payments & status
      let amountPaid = 0;
      let balanceDue = totalAmount;
      let resolvedStatus = 'due';

      const paymentsToCreate: any[] = [];

      if (type === 'paid') {
        amountPaid = totalAmount;
        balanceDue = 0;
        resolvedStatus = 'paid';
        paymentsToCreate.push({
          amount: totalAmount,
          paymentDate: invoiceDate ? new Date(invoiceDate) : new Date(),
          paymentMethod: req.body.paymentPaid?.paymentMethod?.trim() || null,
          transactionRef: req.body.paymentPaid?.transactionId?.trim() || null,
          notes: 'Full payment recorded at invoice creation',
        });
      } else if (req.body.payments && Array.isArray(req.body.payments) && req.body.payments.length > 0) {
        for (const p of req.body.payments) {
          const pAmt = Number(p.amount) || 0;
          if (pAmt > 0) {
            paymentsToCreate.push({
              amount: pAmt,
              paymentDate: p.paymentDate ? new Date(p.paymentDate) : new Date(),
              paymentMethod: p.paymentMethod ? String(p.paymentMethod).trim() : null,
              transactionRef: p.transactionRef ? String(p.transactionRef).trim() : null,
              notes: p.notes ? String(p.notes).trim() : null,
            });
          }
        }
        amountPaid = paymentsToCreate.reduce((sum, p) => sum + p.amount, 0);
        balanceDue = Math.max(0, totalAmount - amountPaid);
        resolvedStatus = balanceDue === 0 && totalAmount > 0 ? 'paid' : amountPaid > 0 ? 'partially_paid' : 'due';
      } else if (initialPayment && initialPayment.amount > 0) {
        const initAmt = Number(initialPayment.amount);
        amountPaid = initAmt;
        balanceDue = Math.max(0, totalAmount - initAmt);
        resolvedStatus = balanceDue === 0 ? 'paid' : 'partially_paid';
        paymentsToCreate.push({
          amount: initAmt,
          paymentDate: initialPayment.paymentDate ? new Date(initialPayment.paymentDate) : new Date(),
          paymentMethod: initialPayment.paymentMethod ? String(initialPayment.paymentMethod).trim() : null,
          transactionRef: initialPayment.transactionRef ? String(initialPayment.transactionRef).trim() : null,
          notes: initialPayment.notes ? String(initialPayment.notes).trim() : 'Initial payment',
        });
      }

      return tx.invoice.create({
        data: {
          workspaceId,
          clientId: resolvedClientId || null,
          paymentAccountId: resolvedPaymentAccountId || null,
          invoiceNumber,
          invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
          dueDate: (dueDate || req.body.paymentDue?.dueDate) ? new Date(dueDate || req.body.paymentDue?.dueDate) : null,
          servicePeriod,
          servicePeriodStart: servicePeriodStart ? new Date(servicePeriodStart) : null,
          servicePeriodEnd: servicePeriodEnd ? new Date(servicePeriodEnd) : null,
          type,
          status: resolvedStatus,
          billingMode,
          template,
          currency,
          subtotal,
          discount: discVal,
          discountType,
          taxRate: taxVal,
          taxAmount,
          totalAmount,
          amountPaid,
          balanceDue,
          notes,
          paymentTerms,
          senderSnapshot: senderSnapshot || {},
          clientSnapshot: clientSnapshot || {},
          accountSnapshot: accountSnapshot || {},
          design: req.body.design || {},
          lineItems: {
            create: parsedLineItems,
          },
          payments: {
            create: paymentsToCreate,
          },
        },
        include: {
          client: true,
          paymentAccount: true,
          lineItems: { orderBy: { sortOrder: 'asc' } },
          payments: { orderBy: { paymentDate: 'desc' } },
        },
      });
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('createInvoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice.' });
  }
}

export async function updateInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const uuid = getParam(req.params.id);
    const workspaceId = req.workspaceId!;
    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      servicePeriod,
      servicePeriodStart,
      servicePeriodEnd,
      type,
      status: explicitStatus,
      billingMode = 'fixed',
      template,
      currency,
      discount,
      discountType,
      taxRate,
      notes,
      paymentTerms,
      clientId,
      clientUuid,
      paymentAccountId,
      paymentAccountUuid,
      senderSnapshot,
      clientSnapshot,
      accountSnapshot,
      lineItems,
    } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findFirst({
        where: { uuid, workspaceId },
        include: { payments: true },
      });

      if (!existing) {
        return null;
      }

      // Auto-harvest or resolve client
      const targetClientUuid = clientUuid || clientId;
      const resolvedClientId = await resolveClientId(workspaceId, targetClientUuid, clientSnapshot, tx);

      // Auto-harvest or resolve payment account
      const targetAccountUuid = paymentAccountUuid || paymentAccountId;
      const resolvedPaymentAccountId = await resolvePaymentAccountId(
        workspaceId,
        targetAccountUuid,
        accountSnapshot,
        tx
      );

      let subtotal = existing.subtotal;
      let totalAmount = existing.totalAmount;
      let discVal = discount !== undefined ? Number(discount) : existing.discount;
      let discType = discountType || existing.discountType;
      let taxVal = taxRate !== undefined ? Number(taxRate) : existing.taxRate;
      let taxAmount = existing.taxAmount;

      let lineItemsUpdate: any = undefined;
      if (lineItems && Array.isArray(lineItems)) {
        const parsedItems = (lineItems as LineItemInput[]).map((item, idx) => {
          let amount = Number(item.amount) || 0;
          const hours = Number(item.hours) || 0;
          const rate = Number(item.rate) || 0;
          if (billingMode === 'hourly' && hours > 0 && rate > 0) {
            amount = hours * rate;
          }
          return {
            title: item.title || '',
            subtitle: item.subtitle || '',
            hours,
            rate,
            amount,
            sortOrder: idx,
          };
        });

        subtotal = parsedItems.reduce((acc, it) => acc + it.amount, 0);
        const discountAmount = discType === 'percentage' ? (subtotal * discVal) / 100 : discVal;
        const afterDiscount = Math.max(0, subtotal - discountAmount);
        taxAmount = (afterDiscount * taxVal) / 100;
        totalAmount = afterDiscount + taxAmount;

        await tx.invoiceItem.deleteMany({ where: { invoiceId: existing.id } });
        lineItemsUpdate = {
          create: parsedItems,
        };
      }

      if (req.body.payments && Array.isArray(req.body.payments)) {
        await tx.invoicePayment.deleteMany({ where: { invoiceId: existing.id } });
        const paymentsList = req.body.payments
          .map((p: any) => ({
            amount: Number(p.amount) || 0,
            paymentDate: p.paymentDate ? new Date(p.paymentDate) : new Date(),
            paymentMethod: p.paymentMethod ? String(p.paymentMethod).trim() : null,
            transactionRef: p.transactionRef ? String(p.transactionRef).trim() : null,
            notes: p.notes ? String(p.notes).trim() : null,
            invoiceId: existing.id,
          }))
          .filter((p: any) => p.amount > 0);

        if (paymentsList.length > 0) {
          await tx.invoicePayment.createMany({
            data: paymentsList,
          });
        }
      }

      const allPayments = await tx.invoicePayment.findMany({
        where: { invoiceId: existing.id },
      });

      const totalPaymentsReceived = allPayments.reduce(
        (acc: number, p: { amount: number }) => acc + p.amount,
        0
      );
      const resolvedType = type || existing.type;
      let amountPaid = totalPaymentsReceived;
      let balanceDue = Math.max(0, totalAmount - amountPaid);
      let resolvedStatus = existing.status;

      if (resolvedType === 'paid') {
        amountPaid = totalAmount;
        balanceDue = 0;
        resolvedStatus = 'paid';
      } else {
        if (amountPaid >= totalAmount && totalAmount > 0) {
          resolvedStatus = 'paid';
        } else if (amountPaid > 0) {
          resolvedStatus = 'partially_paid';
        } else {
          resolvedStatus = explicitStatus || 'due';
        }
      }

      return tx.invoice.update({
        where: { id: existing.id },
        data: {
          ...(invoiceNumber && { invoiceNumber }),
          ...(invoiceDate && { invoiceDate: new Date(invoiceDate) }),
          dueDate: (dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : (req.body.paymentDue?.dueDate ? new Date(req.body.paymentDue.dueDate) : null)),
          servicePeriod,
          ...(servicePeriodStart !== undefined && {
            servicePeriodStart: servicePeriodStart ? new Date(servicePeriodStart) : null,
          }),
          ...(servicePeriodEnd !== undefined && {
            servicePeriodEnd: servicePeriodEnd ? new Date(servicePeriodEnd) : null,
          }),
          type: resolvedType,
          status: resolvedStatus,
          billingMode,
          ...(template && { template }),
          ...(currency && { currency }),
          subtotal,
          discount: discVal,
          discountType: discType,
          taxRate: taxVal,
          taxAmount,
          totalAmount,
          amountPaid,
          balanceDue,
          notes,
          paymentTerms,
          clientId: resolvedClientId || null,
          paymentAccountId: resolvedPaymentAccountId || null,
          ...(senderSnapshot && { senderSnapshot }),
          ...(clientSnapshot && { clientSnapshot }),
          ...(accountSnapshot && { accountSnapshot }),
          ...(req.body.design !== undefined && { design: req.body.design }),
          ...(lineItemsUpdate && { lineItems: lineItemsUpdate }),
        },
        include: {
          client: true,
          paymentAccount: true,
          lineItems: { orderBy: { sortOrder: 'asc' } },
          payments: { orderBy: { paymentDate: 'desc' } },
        },
      });
    });

    if (!updated) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error('updateInvoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice.' });
  }
}

export async function deleteInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const uuid = getParam(req.params.id);

    const existing = await prisma.invoice.findFirst({
      where: { uuid, workspaceId: req.workspaceId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }

    await prisma.invoice.delete({ where: { id: existing.id } });
    res.json({ success: true, message: 'Invoice deleted successfully.' });
  } catch (error) {
    console.error('deleteInvoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice.' });
  }
}

export async function recordPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const uuid = getParam(req.params.id);
    const workspaceId = req.workspaceId!;
    const { amount, paymentDate, paymentMethod, transactionRef, notes } = req.body;

    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      res.status(400).json({ error: 'Valid payment amount is required.' });
      return;
    }

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { uuid, workspaceId },
        include: { payments: true },
      });

      if (!invoice) {
        return null;
      }

      await tx.invoicePayment.create({
        data: {
          invoiceId: invoice.id,
          amount: paymentAmount,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          paymentMethod: paymentMethod ? String(paymentMethod).trim() : null,
          transactionRef: transactionRef ? String(transactionRef).trim() : null,
          notes: notes ? String(notes).trim() : null,
        },
      });

      const allPayments = await tx.invoicePayment.findMany({
        where: { invoiceId: invoice.id },
      });

      const newAmountPaid = allPayments.reduce((acc: number, p: { amount: number }) => acc + p.amount, 0);
      const newBalanceDue = Math.max(0, invoice.totalAmount - newAmountPaid);

      const isFullyPaid = newBalanceDue === 0;
      const updatedStatus = isFullyPaid ? 'paid' : 'partially_paid';
      const updatedType = isFullyPaid ? 'paid' : invoice.type;

      return tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newAmountPaid,
          balanceDue: newBalanceDue,
          status: updatedStatus,
          type: updatedType,
        },
        include: {
          client: true,
          paymentAccount: true,
          lineItems: { orderBy: { sortOrder: 'asc' } },
          payments: { orderBy: { paymentDate: 'desc' } },
        },
      });
    });

    if (!updatedInvoice) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }

    res.status(201).json(updatedInvoice);
  } catch (error) {
    console.error('recordPayment error:', error);
    res.status(500).json({ error: 'Failed to record payment.' });
  }
}
