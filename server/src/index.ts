import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { requireAuth } from './middleware/auth.js';
import * as authController from './controllers/authController.js';
import * as workspaceController from './controllers/workspaceController.js';
import * as clientController from './controllers/clientController.js';
import * as accountController from './controllers/accountController.js';
import * as invoiceController from './controllers/invoiceController.js';
import * as pdfController from './controllers/pdfController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', requireAuth, authController.getMe);

// Workspace Profile Routes
app.get('/api/workspace', requireAuth, workspaceController.getWorkspace);
app.patch('/api/workspace', requireAuth, workspaceController.updateWorkspace);

// Clients Routes
app.get('/api/clients', requireAuth, clientController.getClients);
app.post('/api/clients', requireAuth, clientController.createClient);
app.put('/api/clients/:id', requireAuth, clientController.updateClient);
app.delete('/api/clients/:id', requireAuth, clientController.deleteClient);

// Payment Accounts Routes
app.get('/api/accounts', requireAuth, accountController.getAccounts);
app.post('/api/accounts', requireAuth, accountController.createAccount);
app.put('/api/accounts/:id', requireAuth, accountController.updateAccount);
app.delete('/api/accounts/:id', requireAuth, accountController.deleteAccount);

// Invoices Routes
app.get('/api/invoices', requireAuth, invoiceController.getInvoices);
app.get('/api/invoices/:id', requireAuth, invoiceController.getInvoice);
app.post('/api/invoices', requireAuth, invoiceController.createInvoice);
app.put('/api/invoices/:id', requireAuth, invoiceController.updateInvoice);
app.delete('/api/invoices/:id', requireAuth, invoiceController.deleteInvoice);
app.post('/api/invoices/:id/payments', requireAuth, invoiceController.recordPayment);

// Vector PDF Export Route
app.post('/api/pdf/generate', requireAuth, pdfController.generatePdf);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;

