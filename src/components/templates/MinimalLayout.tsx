import { memo } from 'react';
import type { InvoiceData } from '../../types/invoice';
import { formatCurrency } from '../../types/invoice';
import { useInvoiceCalculations } from './shared/useInvoiceCalculations';

interface Props {
  data: InvoiceData;
}

function MinimalLayout({ data }: Props) {
  const {
    subtotal,
    discountAmount,
    taxAmount,
    total,
    paymentsTotal,
    isPaidReceipt,
    hasPartialPayments,
    balanceDue,
    hasLineItems,
    formatDate,
    formattedPeriod,
    receivedDate,
    sheetWidth,
    sheetMinHeight,
    paddingVal,
  } = useInvoiceCalculations(data);

  const fontSizeVal = data.design?.fontSizePt ? `${data.design.fontSizePt}px` : '13px';
  const fontFamilyVal =
    data.design?.fontFamily === 'serif'
      ? "'Georgia', serif"
      : data.design?.fontFamily === 'mono'
      ? "'Courier New', monospace"
      : "'Inter', system-ui, -apple-system, sans-serif";

  return (
    <div
      style={{
        fontFamily: fontFamilyVal,
        width: sheetWidth,
        minHeight: sheetMinHeight,
        padding: paddingVal,
        backgroundColor: '#ffffff',
        color: '#1e293b',
        fontSize: fontSizeVal,
        lineHeight: '1.5',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Top Header: Asymmetrical Minimal Editorial ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '18px',
        }}
      >
        {/* Sender Branding */}
        <div style={{ maxWidth: '55%' }}>
          {data.sender.logo && (
            <img
              src={data.sender.logo}
              alt="Logo"
              style={{
                width: '38px',
                height: '38px',
                objectFit: 'contain',
                marginBottom: '8px',
              }}
            />
          )}
          {data.sender.name && (
            <div
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#0f172a',
                lineHeight: '1.2',
                letterSpacing: '-0.02em',
                marginBottom: '2px',
              }}
            >
              {data.sender.name}
            </div>
          )}
          {data.sender.title && (
            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 400, marginBottom: '4px' }}>
              {data.sender.title}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5px', color: '#94a3b8', fontSize: '11px', lineHeight: '1.35' }}>
            {data.sender.email && <div>{data.sender.email}</div>}
            {data.sender.phone && <div>{data.sender.phone}</div>}
            {data.sender.address && <div style={{ whiteSpace: 'pre-line' }}>{data.sender.address}</div>}
            {data.sender.taxId && (
              <div style={{ fontSize: '11px', marginTop: '1px' }}>
                Tax ID: <span style={{ color: '#64748b' }}>{data.sender.taxId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Title & Metadata */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: isPaidReceipt ? '#059669' : '#0f172a',
              marginBottom: '3px',
            }}
          >
            {isPaidReceipt ? 'Receipt' : 'Invoice'}
          </div>
          {data.invoiceNumber && (
            <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>
              #{data.invoiceNumber}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end', color: '#64748b', fontSize: '11px' }}>
            {data.invoiceDate && (
              <div>
                <span style={{ color: '#94a3b8' }}>Issued: </span>
                <span style={{ color: '#334155', fontWeight: 500 }}>{formatDate(data.invoiceDate)}</span>
              </div>
            )}
            {isPaidReceipt ? (
              receivedDate ? (
                <div>
                  <span style={{ color: '#94a3b8' }}>Payment Received: </span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>{receivedDate}</span>
                </div>
              ) : null
            ) : (
              (data.dueDate || data.paymentDue?.dueDate) && (
                <div>
                  <span style={{ color: '#94a3b8' }}>Due: </span>
                  <span style={{ color: '#d97706', fontWeight: 600 }}>{formatDate(data.dueDate || data.paymentDue?.dueDate || '')}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Bill To & Details Strip (Clean Hairline Separator) ── */}
      <div
        style={{
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '12px',
          marginBottom: '18px',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '16px',
        }}
      >
        {/* Column 1: Bill To */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            Billed To
          </div>
          {data.client.name && (
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px', marginBottom: '1px' }}>
              {data.client.name}
            </div>
          )}
          {data.client.companyName && (
            <div style={{ color: '#475569', fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>
              {data.client.companyName}
            </div>
          )}
          <div style={{ color: '#94a3b8', fontSize: '11px', lineHeight: '1.35' }}>
            {data.client.email && <div>{data.client.email}</div>}
            {data.client.phone && <div>{data.client.phone}</div>}
            {data.client.address && <div style={{ whiteSpace: 'pre-line' }}>{data.client.address}</div>}
            {data.client.taxId && <div>Tax ID: {data.client.taxId}</div>}
          </div>
        </div>

        {/* Column 2: Period & Terms */}
        <div style={{ textAlign: 'right' }}>
          {formattedPeriod && (
            <div style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                Service Period
              </div>
              <div style={{ fontSize: '11px', color: '#334155', fontWeight: 500 }}>
                {formattedPeriod}
              </div>
            </div>
          )}
          {isPaidReceipt ? (
            data.paymentPaid?.paymentMethod ? (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                  Payment Method
                </div>
                <div style={{ fontSize: '11px', color: '#334155', fontWeight: 500 }}>
                  {data.paymentPaid.paymentMethod}
                </div>
              </div>
            ) : null
          ) : (
            data.paymentDue?.paymentTerms ? (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                  Payment Terms
                </div>
                <div style={{ fontSize: '11px', color: '#334155', fontWeight: 500 }}>
                  {data.paymentDue.paymentTerms}
                </div>
              </div>
            ) : null
          )}
          <div style={{ marginTop: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: isPaidReceipt ? '#ecfdf5' : hasPartialPayments ? '#eff6ff' : '#fffbeb',
                color: isPaidReceipt ? '#059669' : hasPartialPayments ? '#2563eb' : '#b45309',
                border: `1px solid ${isPaidReceipt ? '#a7f3d0' : hasPartialPayments ? '#bfdbfe' : '#fde68a'}`,
              }}
            >
              {isPaidReceipt ? 'Paid in Full' : hasPartialPayments ? 'Partially Paid' : 'Payment Due'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Line Items Table: Open Scandinavian Hairline Table ── */}
      {hasLineItems ? (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #0f172a' }}>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '7px 0',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#64748b',
                  }}
                >
                  Description
                </th>
                {data.billingMode === 'hourly' && (
                  <>
                    <th
                      style={{
                        textAlign: 'center',
                        padding: '7px 10px',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#64748b',
                        width: '80px',
                      }}
                    >
                      Hours
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '7px 10px',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#64748b',
                        width: '100px',
                      }}
                    >
                      Rate
                    </th>
                  </>
                )}
                <th
                  style={{
                    textAlign: 'right',
                    padding: '7px 0',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#64748b',
                    width: '120px',
                  }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.map((item, idx) => (
                <tr key={item.uuid || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '7px 0', verticalAlign: 'top' }}>
                    <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '13px' }}>{item.title}</div>
                    {item.subtitle && (
                      <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px', whiteSpace: 'pre-wrap' }}>
                        {item.subtitle}
                      </div>
                    )}
                  </td>
                  {data.billingMode === 'hourly' && (
                    <>
                      <td style={{ textAlign: 'center', padding: '7px 10px', color: '#64748b', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        {item.hours && item.hours > 0 ? item.hours : '—'}
                      </td>
                      <td style={{ textAlign: 'right', padding: '7px 10px', color: '#64748b', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        {item.rate && item.rate > 0 ? formatCurrency(item.rate, data.currency) : '—'}
                      </td>
                    </>
                  )}
                  <td style={{ textAlign: 'right', padding: '7px 0', color: '#0f172a', fontWeight: 600, verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    {formatCurrency(item.amount, data.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Summary & Totals: Quiet Clean Hairline Stack ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <div style={{ width: '250px' }}>
              {subtotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748b', fontSize: '12px' }}>
                  <span>Subtotal</span>
                  <span style={{ color: '#0f172a' }}>{formatCurrency(subtotal, data.currency)}</span>
                </div>
              )}
              {((data.discount ?? 0) > 0) && discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748b', fontSize: '12px' }}>
                  <span>Discount {data.discountType === 'percentage' && `(${data.discount}%)`}</span>
                  <span style={{ color: '#e11d48' }}>-{formatCurrency(discountAmount, data.currency)}</span>
                </div>
              )}
              {((data.taxRate ?? 0) > 0) && taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748b', fontSize: '12px' }}>
                  <span>Tax ({data.taxRate}%)</span>
                  <span style={{ color: '#0f172a' }}>{formatCurrency(taxAmount, data.currency)}</span>
                </div>
              )}
              
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '7px 0',
                  borderTop: '1px solid #e2e8f0',
                  borderBottom: '2px solid #0f172a',
                  marginTop: '4px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#0f172a',
                }}
              >
                <span>Total</span>
                <span>{formatCurrency(total, data.currency)}</span>
              </div>

              {hasPartialPayments && paymentsTotal > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#059669', fontSize: '12px', fontWeight: 600 }}>
                    <span>Amount Paid</span>
                    <span>-{formatCurrency(paymentsTotal, data.currency)}</span>
                  </div>
                  {balanceDue > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        borderTop: '1px dashed #cbd5e1',
                        marginTop: '3px',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      <span>Balance Due</span>
                      <span>{formatCurrency(balanceDue, data.currency)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: '#94a3b8',
            border: '1px dashed #e2e8f0',
            borderRadius: '6px',
            margin: '18px 0',
            fontSize: '12px',
          }}
        >
          No line items added yet.
        </div>
      )}

      {/* ── Remittance Information (Understated Footnote Block) ── */}
      {!isPaidReceipt && data.paymentDue?.account?.bankName && (
        <div
          style={{
            borderTop: '1px solid #f1f5f9',
            paddingTop: '10px',
            marginBottom: '10px',
            fontSize: '11px',
            color: '#64748b',
          }}
        >
          <div style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontSize: '10px' }}>
            Remittance Details
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: '#475569', fontSize: '11px' }}>
            <span>Bank: <strong style={{ color: '#0f172a' }}>{data.paymentDue.account.bankName}</strong></span>
            {data.paymentDue.account.accountNumber && (
              <span>Account: <strong style={{ color: '#0f172a' }}>{data.paymentDue.account.accountNumber}</strong></span>
            )}
            {data.paymentDue.account.routingOrIfsc && (
              <span>Routing/IFSC: <strong style={{ color: '#0f172a' }}>{data.paymentDue.account.routingOrIfsc}</strong></span>
            )}
            {data.paymentDue.account.swiftBic && (
              <span>SWIFT/BIC: <strong style={{ color: '#0f172a' }}>{data.paymentDue.account.swiftBic}</strong></span>
            )}
            {data.paymentDue.account.upiId && (
              <span>UPI: <strong style={{ color: '#0f172a' }}>{data.paymentDue.account.upiId}</strong></span>
            )}
          </div>
        </div>
      )}

      {/* ── Notes ── */}
      {data.notes && (
        <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
          <div style={{ color: '#94a3b8', fontSize: '11px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
            {data.notes}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(MinimalLayout);
