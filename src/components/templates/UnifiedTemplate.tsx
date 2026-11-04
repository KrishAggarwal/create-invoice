import { memo } from 'react';
import type { InvoiceData } from '../../types/invoice';
import { formatCurrency } from '../../types/invoice';
import { useInvoiceCalculations } from './shared/useInvoiceCalculations';

interface Props {
  data: InvoiceData;
}

interface StylePreset {
  headerLayout: 'side-by-side' | 'stacked';
  accentBar: boolean;
  tableBgHeader: string;
  tableBgRow: string;
  tableAlternateRows: boolean;
  cardBg: string;
  cardBorder: string;
  badgeStyle: 'pill' | 'square';
  fontWeightHeader: number;
  borderRadiusCard: string;
}

const stylePresets: Record<string, StylePreset> = {
  minimal: {
    headerLayout: 'side-by-side',
    accentBar: false,
    tableBgHeader: 'transparent',
    tableBgRow: 'transparent',
    tableAlternateRows: false,
    cardBg: '#f8fafc',
    cardBorder: '#e2e8f0',
    badgeStyle: 'square',
    fontWeightHeader: 700,
    borderRadiusCard: '8px',
  },
  modern: {
    headerLayout: 'side-by-side',
    accentBar: true,
    tableBgHeader: '#0f172a',
    tableBgRow: '#ffffff',
    tableAlternateRows: true,
    cardBg: '#f8fafc',
    cardBorder: '#e2e8f0',
    badgeStyle: 'pill',
    fontWeightHeader: 800,
    borderRadiusCard: '8px',
  },
  executive: {
    headerLayout: 'stacked',
    accentBar: false,
    tableBgHeader: '#1e293b',
    tableBgRow: '#ffffff',
    tableAlternateRows: false,
    cardBg: '#fafaf9',
    cardBorder: '#d6d3d1',
    badgeStyle: 'square',
    fontWeightHeader: 800,
    borderRadiusCard: '6px',
  },
  tech: {
    headerLayout: 'side-by-side',
    accentBar: true,
    tableBgHeader: '#18181b',
    tableBgRow: '#ffffff',
    tableAlternateRows: true,
    cardBg: '#f4f4f5',
    cardBorder: '#e4e4e7',
    badgeStyle: 'square',
    fontWeightHeader: 900,
    borderRadiusCard: '12px',
  },
};

function UnifiedTemplate({ data }: Props) {
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
    sheetWidth,
    sheetMinHeight,
    paddingVal,
    accentColor,
  } = useInvoiceCalculations(data);

  const style = stylePresets[data.template] || stylePresets.minimal;

  const fontSizeVal = data.design?.fontSizePt ? `${data.design.fontSizePt}px` : '13px';
  const fontFamilyVal =
    data.design?.fontFamily === 'serif'
      ? "'Georgia', serif"
      : data.design?.fontFamily === 'mono'
      ? "'Courier New', monospace"
      : "'Inter', system-ui, -apple-system, sans-serif";

  const containerStyle: React.CSSProperties = {
    fontFamily: fontFamilyVal,
    width: sheetWidth,
    minHeight: sheetMinHeight,
    backgroundColor: '#ffffff',
    color: '#1e293b',
    fontSize: fontSizeVal,
    lineHeight: '1.5',
    position: 'relative',
    boxSizing: 'border-box',
    display: style.accentBar ? 'flex' : 'block',
  };

  const contentStyle: React.CSSProperties = style.accentBar
    ? { flex: 1, padding: paddingVal }
    : { padding: paddingVal };

  return (
    <div style={containerStyle}>
      {style.accentBar && (
        <div
          style={{
            width: '8px',
            backgroundColor: accentColor,
            flexShrink: 0,
          }}
        />
      )}

      <div style={contentStyle}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '28px',
            paddingBottom: style.headerLayout === 'side-by-side' ? '20px' : '0',
            borderBottom: style.headerLayout === 'side-by-side' ? '1px solid #e2e8f0' : 'none',
          }}
        >
          {/* Sender */}
          <div>
            {data.sender.logo && (
              <img
                src={data.sender.logo}
                alt="Logo"
                style={{
                  width: '48px',
                  height: '48px',
                  objectFit: 'contain',
                  marginBottom: '10px',
                  borderRadius: '6px',
                }}
              />
            )}
            {data.sender.name && (
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: style.fontWeightHeader,
                  color: '#0f172a',
                  lineHeight: '1.25',
                  marginBottom: '4px',
                  letterSpacing: '-0.3px',
                }}
              >
                {data.sender.name}
              </div>
            )}
            {data.sender.title && (
              <div style={{ color: '#475569', fontSize: '13px', fontWeight: 500, lineHeight: '1.4', marginBottom: '6px' }}>
                {data.sender.title}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', color: '#64748b', fontSize: '12px', lineHeight: '1.45' }}>
              {data.sender.email && <div>{data.sender.email}</div>}
              {data.sender.phone && <div>{data.sender.phone}</div>}
              {data.sender.address && <div style={{ whiteSpace: 'pre-line' }}>{data.sender.address}</div>}
              {data.sender.taxId && (
                <div style={{ fontSize: '11px' }}>
                  Tax ID: <span style={{ fontWeight: 600 }}>{data.sender.taxId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Meta */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '28px',
                fontWeight: style.fontWeightHeader,
                color: isPaidReceipt ? '#059669' : accentColor,
                letterSpacing: '-0.5px',
                textTransform: 'uppercase',
                lineHeight: '1.2',
                marginBottom: '6px',
              }}
            >
              {isPaidReceipt ? 'Receipt' : 'Invoice'}
            </div>
            {data.invoiceNumber && (
              <div style={{ color: '#0f172a', fontSize: '14px', fontWeight: 600, lineHeight: '1.4', marginBottom: '6px' }}>
                #{data.invoiceNumber}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-end', color: '#64748b', fontSize: '12px' }}>
              {data.invoiceDate && (
                <div>
                  Date: <span style={{ color: '#334155', fontWeight: 500 }}>{formatDate(data.invoiceDate)}</span>
                </div>
              )}
              {formattedPeriod && (
                <div>
                  Period: <span style={{ color: '#334155' }}>{formattedPeriod}</span>
                </div>
              )}
              {!isPaidReceipt && (data.dueDate || data.paymentDue?.dueDate) && (
                <div>
                  Due: <span style={{ color: '#b45309', fontWeight: 600 }}>{formatDate(data.dueDate || data.paymentDue?.dueDate || '')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bill To */}
        {(data.client.name || data.client.companyName) && (
          <div style={{ marginBottom: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
              Bill To
            </div>
            {data.client.name && (
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px', lineHeight: '1.3', marginBottom: '3px' }}>
                {data.client.name}
              </div>
            )}
            {data.client.companyName && (
              <div style={{ color: '#334155', fontSize: '13px', fontWeight: 500, lineHeight: '1.4', marginBottom: '4px' }}>
                {data.client.companyName}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', color: '#64748b', fontSize: '12px' }}>
              {data.client.email && <div>{data.client.email}</div>}
              {data.client.phone && <div>{data.client.phone}</div>}
              {data.client.address && <div style={{ whiteSpace: 'pre-line' }}>{data.client.address}</div>}
            </div>
          </div>
        )}

        {/* Line Items Table */}
        {hasLineItems ? (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      backgroundColor: style.tableBgHeader,
                      color: style.tableBgHeader === 'transparent' ? '#64748b' : '#ffffff',
                      borderBottom: style.tableBgHeader === 'transparent' ? '2px solid #e2e8f0' : 'none',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      borderRadius: style.tableBgHeader !== 'transparent' ? '6px 0 0 0' : '0',
                    }}
                  >
                    Description
                  </th>
                  {data.billingMode === 'hourly' && (
                    <>
                      <th
                        style={{
                          textAlign: 'center',
                          padding: '10px 12px',
                          backgroundColor: style.tableBgHeader,
                          color: style.tableBgHeader === 'transparent' ? '#64748b' : '#ffffff',
                          borderBottom: style.tableBgHeader === 'transparent' ? '2px solid #e2e8f0' : 'none',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          width: '80px',
                        }}
                      >
                        Hours
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '10px 12px',
                          backgroundColor: style.tableBgHeader,
                          color: style.tableBgHeader === 'transparent' ? '#64748b' : '#ffffff',
                          borderBottom: style.tableBgHeader === 'transparent' ? '2px solid #e2e8f0' : 'none',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
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
                      padding: '10px 12px',
                      backgroundColor: style.tableBgHeader,
                      color: style.tableBgHeader === 'transparent' ? '#64748b' : '#ffffff',
                      borderBottom: style.tableBgHeader === 'transparent' ? '2px solid #e2e8f0' : 'none',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      width: '130px',
                      borderRadius: style.tableBgHeader !== 'transparent' ? '0 6px 0 0' : '0',
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item, idx) => {
                  const rowBg = style.tableAlternateRows && idx % 2 === 1 ? '#f8fafc' : style.tableBgRow;
                  return (
                    <tr key={item.uuid || idx}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', backgroundColor: rowBg }}>
                        <div style={{ color: '#0f172a', fontWeight: 600 }}>{item.title}</div>
                        {item.subtitle && (
                          <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px', whiteSpace: 'pre-wrap' }}>
                            {item.subtitle}
                          </div>
                        )}
                      </td>
                      {data.billingMode === 'hourly' && (
                        <>
                          <td style={{ textAlign: 'center', padding: '12px', borderBottom: '1px solid #f1f5f9', backgroundColor: rowBg, color: '#475569' }}>
                            {item.hours && item.hours > 0 ? item.hours : '—'}
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid #f1f5f9', backgroundColor: rowBg, color: '#475569' }}>
                            {item.rate && item.rate > 0 ? formatCurrency(item.rate, data.currency) : '—'}
                          </td>
                        </>
                      )}
                      <td style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid #f1f5f9', backgroundColor: rowBg, color: '#0f172a', fontWeight: 600 }}>
                        {formatCurrency(item.amount, data.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <div style={{ width: '280px' }}>
                {subtotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#64748b', fontSize: '13px' }}>
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, data.currency)}</span>
                  </div>
                )}
                {((data.discount ?? 0) > 0) && discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#64748b', fontSize: '13px' }}>
                    <span>Discount {data.discountType === 'percentage' && `(${data.discount}%)`}</span>
                    <span style={{ color: '#e11d48' }}>-{formatCurrency(discountAmount, data.currency)}</span>
                  </div>
                )}
                {((data.taxRate ?? 0) > 0) && taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#64748b', fontSize: '13px' }}>
                    <span>Tax ({data.taxRate}%)</span>
                    <span>{formatCurrency(taxAmount, data.currency)}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderTop: '2px solid #e2e8f0',
                    marginTop: '6px',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#0f172a',
                    backgroundColor: style.tableBgHeader !== 'transparent' ? style.tableBgHeader : 'transparent',
                    ...(style.tableBgHeader !== 'transparent' && { color: '#ffffff', borderRadius: '6px' }),
                  }}
                >
                  <span>Total</span>
                  <span>{formatCurrency(total, data.currency)}</span>
                </div>
                {hasPartialPayments && paymentsTotal > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#059669', fontSize: '13px', fontWeight: 600 }}>
                      <span>Paid</span>
                      <span>-{formatCurrency(paymentsTotal, data.currency)}</span>
                    </div>
                    {balanceDue > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderTop: '1px dashed #cbd5e1',
                          marginTop: '4px',
                          fontSize: '16px',
                          fontWeight: 800,
                          color: '#b45309',
                        }}
                      >
                        <span>Balance Due</span>
                        <span>{formatCurrency(balanceDue, data.currency)}</span>
                      </div>
                    )}
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '5px 14px',
                      borderRadius: style.badgeStyle === 'pill' ? '20px' : '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      backgroundColor: isPaidReceipt ? '#ecfdf5' : hasPartialPayments ? '#eff6ff' : '#fffbeb',
                      color: isPaidReceipt ? '#059669' : hasPartialPayments ? '#2563eb' : '#b45309',
                      border: `1px solid ${isPaidReceipt ? '#a7f3d0' : hasPartialPayments ? '#bfdbfe' : '#fde68a'}`,
                    }}
                  >
                    {isPaidReceipt ? '✓ PAID' : hasPartialPayments ? 'PARTIAL' : 'DUE'}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              color: '#94a3b8',
              border: '1px dashed #e2e8f0',
              borderRadius: style.borderRadiusCard,
              margin: '28px 0',
              fontSize: '13px',
            }}
          >
            No line items added yet.
          </div>
        )}

        {/* Payment Instructions */}
        {!isPaidReceipt && data.paymentDue?.account?.bankName && (
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: style.cardBg,
              borderRadius: style.borderRadiusCard,
              marginBottom: '24px',
              border: `1px solid ${style.cardBorder}`,
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              Payment Instructions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px 16px', fontSize: '12px' }}>
              {data.paymentDue.account.bankName && (
                <div>
                  <span style={{ color: '#64748b' }}>Bank: </span>
                  <span style={{ color: '#0f172a', fontWeight: 500 }}>{data.paymentDue.account.bankName}</span>
                </div>
              )}
              {data.paymentDue.account.accountNumber && (
                <div>
                  <span style={{ color: '#64748b' }}>Account: </span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{data.paymentDue.account.accountNumber}</span>
                </div>
              )}
              {data.paymentDue.account.routingOrIfsc && (
                <div>
                  <span style={{ color: '#64748b' }}>Routing: </span>
                  <span style={{ color: '#0f172a', fontWeight: 500 }}>{data.paymentDue.account.routingOrIfsc}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <div style={{ color: '#64748b', fontSize: '12px', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {data.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders during typing
export default memo(UnifiedTemplate);
