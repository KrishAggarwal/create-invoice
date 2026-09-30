import type { InvoiceData } from '../../types/invoice';
import {
  formatCurrency,
  calculateSubtotal,
  calculateDiscount,
  calculateTotal,
} from '../../types/invoice';

interface Props {
  data: InvoiceData;
}

/**
 * Modern Template — Navy sidebar accent, card-style layout, bolder typography.
 * Uses inline styles for PDF rendering reliability.
 */
export default function ModernTemplate({ data }: Props) {
  const subtotal = calculateSubtotal(data.lineItems);
  const discountAmount = calculateDiscount(
    subtotal,
    data.discount,
    data.discountType
  );
  const total = calculateTotal(subtotal, discountAmount);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isPaid = data.type === 'paid';

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        width: '210mm',
        backgroundColor: '#ffffff',
        color: '#1e293b',
        fontSize: '13px',
        lineHeight: '1.5',
        position: 'relative',
        display: 'flex',
        boxSizing: 'border-box',
      }}
    >
      {/* Left Accent Bar */}
      <div
        style={{
          width: '8px',
          backgroundColor: isPaid ? '#047857' : '#102a43',
          flexShrink: 0,
        }}
      />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: '28px 36px',
        }}
      >
        {/* Top: Header with status */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '4px',
              }}
            >
              {data.sender.logo && (
                <img
                  src={data.sender.logo}
                  alt="Logo"
                  style={{
                    width: '40px',
                    height: '40px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
              )}
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#102a43',
                }}
              >
                {data.sender.name || 'Your Name'}
              </div>
            </div>
            <div
              style={{
                color: '#627d98',
                fontSize: '12px',
                marginTop: data.sender.title ? '2px' : '8px',
                lineHeight: '1.7',
              }}
            >
              {data.sender.title && (
                <div style={{ color: '#334e68', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                  {data.sender.title}
                </div>
              )}
              {data.sender.email && <div>{data.sender.email}</div>}
              {data.sender.phone && <div>{data.sender.phone}</div>}
              {data.sender.address && (
                <div style={{ whiteSpace: 'pre-line' }}>
                  {data.sender.address}
                </div>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#102a43',
                marginBottom: '8px',
                letterSpacing: '-0.5px',
              }}
            >
              INVOICE
            </div>
          </div>
        </div>

        {/* Invoice Meta + Client — Side by side */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          {/* Bill To */}
          <div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#102a43',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '10px',
              }}
            >
              Bill To
            </div>
            <div
              style={{
                fontWeight: 600,
                color: '#243b53',
                fontSize: '14px',
                marginBottom: '4px',
              }}
            >
              {data.client.name || 'Client Name'}
            </div>
            {data.client.companyName && (
              <div style={{ color: '#627d98', fontSize: '12px' }}>
                {data.client.companyName}
              </div>
            )}
            {data.client.email && (
              <div style={{ color: '#627d98', fontSize: '12px' }}>
                {data.client.email}
              </div>
            )}
            {data.client.address && (
              <div
                style={{
                  color: '#627d98',
                  fontSize: '12px',
                  whiteSpace: 'pre-line',
                  marginTop: '2px',
                }}
              >
                {data.client.address}
              </div>
            )}
          </div>

          {/* Meta Details */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#102a43',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '10px',
              }}
            >
              Details
            </div>
            <div style={{ fontSize: '12px', color: '#627d98', lineHeight: '2' }}>
              <div>
                <span style={{ color: '#9fb3c8' }}>Invoice # </span>
                <span style={{ color: '#334e68', fontWeight: 500 }}>
                  {data.invoiceNumber}
                </span>
              </div>
              <div>
                <span style={{ color: '#9fb3c8' }}>Date: </span>
                <span style={{ color: '#334e68' }}>
                  {formatDate(data.invoiceDate)}
                </span>
              </div>
              {data.servicePeriod && (
                <div>
                  <span style={{ color: '#9fb3c8' }}>Period: </span>
                  <span style={{ color: '#334e68' }}>
                    {data.servicePeriod}
                  </span>
                </div>
              )}
              {!isPaid && data.paymentDue?.dueDate && (
                <div>
                  <span style={{ color: '#9fb3c8' }}>Due: </span>
                  <span style={{ color: '#b45309', fontWeight: 600 }}>
                    {formatDate(data.paymentDue.dueDate)}
                  </span>
                </div>
              )}
              {isPaid && data.paymentPaid?.paymentDate && (
                <div>
                  <span style={{ color: '#9fb3c8' }}>Paid: </span>
                  <span style={{ color: '#047857', fontWeight: 600 }}>
                    {formatDate(data.paymentPaid.paymentDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '16px',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  backgroundColor: '#102a43',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderRadius: '6px 0 0 0',
                }}
              >
                Description
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: '12px 16px',
                  backgroundColor: '#102a43',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  width: '80px',
                }}
              >
                Hours
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '12px 16px',
                  backgroundColor: '#102a43',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  width: '120px',
                  borderRadius: '0 6px 0 0',
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((item, index) => (
              <tr key={item.id}>
                <td
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor:
                      index % 2 === 0 ? '#ffffff' : '#f8fafc',
                  }}
                >
                  <div style={{ color: '#334e68', fontWeight: 500 }}>
                    {item.title || '—'}
                  </div>
                  {item.subtitle && (
                    <div style={{ color: '#9fb3c8', fontSize: '11px', marginTop: '2px' }}>
                      {item.subtitle}
                    </div>
                  )}
                </td>
                <td
                  style={{
                    textAlign: 'center',
                    padding: '14px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    color: '#627d98',
                    backgroundColor:
                      index % 2 === 0 ? '#ffffff' : '#f8fafc',
                    verticalAlign: 'top',
                  }}
                >
                  {item.hours > 0 ? item.hours : '—'}
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    padding: '14px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    color: '#243b53',
                    fontWeight: 500,
                    backgroundColor:
                      index % 2 === 0 ? '#ffffff' : '#f8fafc',
                    verticalAlign: 'top',
                  }}
                >
                  {formatCurrency(item.amount, data.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '24px',
          }}
        >
          <div style={{ width: '280px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 16px',
                color: '#627d98',
                fontSize: '13px',
              }}
            >
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, data.currency)}</span>
            </div>

            {data.discount > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 16px',
                  color: '#627d98',
                  fontSize: '13px',
                }}
              >
                <span>
                  Discount
                  {data.discountType === 'percentage'
                    ? ` (${data.discount}%)`
                    : ''}
                </span>
                <span>-{formatCurrency(discountAmount, data.currency)}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '14px 16px',
                backgroundColor: '#102a43',
                borderRadius: '6px',
                marginTop: '8px',
                fontSize: '16px',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              <span>{isPaid ? 'Total Paid' : 'Amount Due'}</span>
              <span>{formatCurrency(total, data.currency)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  backgroundColor: isPaid ? '#ecfdf5' : '#fffbeb',
                  color: isPaid ? '#047857' : '#b45309',
                }}
              >
                {isPaid ? '✓ PAID' : 'UNPAID'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        {!isPaid && data.paymentDue && (
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#f0f4f8',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '4px solid #102a43',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#102a43',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '12px',
              }}
            >
              Payment Details
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '12px',
              }}
            >
              {data.paymentDue.account.bankName && (
                <div>
                  <span style={{ color: '#9fb3c8', fontWeight: 500 }}>
                    Bank:{' '}
                  </span>
                  <span style={{ color: '#334e68' }}>
                    {data.paymentDue.account.bankName}
                  </span>
                </div>
              )}
              {data.paymentDue.account.accountNumber && (
                <div>
                  <span style={{ color: '#9fb3c8', fontWeight: 500 }}>
                    Account:{' '}
                  </span>
                  <span style={{ color: '#334e68' }}>
                    {data.paymentDue.account.accountNumber}
                  </span>
                </div>
              )}
              {data.paymentDue.account.routingOrIfsc && (
                <div>
                  <span style={{ color: '#9fb3c8', fontWeight: 500 }}>
                    IFSC/Routing:{' '}
                  </span>
                  <span style={{ color: '#334e68' }}>
                    {data.paymentDue.account.routingOrIfsc}
                  </span>
                </div>
              )}
              {data.paymentDue.account.upiId && (
                <div>
                  <span style={{ color: '#9fb3c8', fontWeight: 500 }}>
                    UPI:{' '}
                  </span>
                  <span style={{ color: '#334e68' }}>
                    {data.paymentDue.account.upiId}
                  </span>
                </div>
              )}
            </div>
            {data.paymentDue.paymentTerms && (
              <div
                style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: '#b45309',
                  fontWeight: 600,
                }}
              >
                Terms: {data.paymentDue.paymentTerms}
              </div>
            )}
          </div>
        )}

        {isPaid && data.paymentPaid && (
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#ecfdf5',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '4px solid #047857',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#047857',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '12px',
              }}
            >
              Payment Received
            </div>
            <div style={{ fontSize: '12px', color: '#334e68' }}>
              {data.paymentPaid.paymentMethod && (
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: '#9fb3c8', fontWeight: 500 }}>
                    Method:{' '}
                  </span>
                  {data.paymentPaid.paymentMethod}
                </div>
              )}
              {data.paymentPaid.transactionId && (
                <div>
                  <span style={{ color: '#9fb3c8', fontWeight: 500 }}>
                    Reference:{' '}
                  </span>
                  {data.paymentPaid.transactionId}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                color: '#627d98',
                fontSize: '12px',
                whiteSpace: 'pre-line',
                lineHeight: '1.6',
              }}
            >
              {data.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
