# Finance API Specifications

This document outlines the API endpoints and data structures required to support the Revenue Statistics Dashboard (`/finance/stats`).

## Base URL
`/api/v1/finance`

## 1. Get Revenue Summary
Retrieves high-level metrics for the selected period.

- **Endpoint:** `GET /stats/summary`
- **Query Parameters:**
  - `startDate`: `YYYY-MM-DD` (e.g., '2024-01-01')
  - `endDate`: `YYYY-MM-DD` (e.g., '2024-01-31')
  - `period`: `daily` | `monthly` (Optional, for aggregation logic)

- **Response Schema:**
```json
{
  "totalSales": 15000000,       // Total Gross Revenue (KRW)
  "refundAmount": 500000,       // Total Refunds (KRW)
  "netSales": 14500000,         // Total - Refunds (KRW)
  "growthRate": 12.5,           // Percentage growth vs previous period
  "topPaymentMethod": {         // Dominant payment method
    "method": "CARD",           // 'CARD' | 'CASH' | 'TRANSFER'
    "percentage": 65.0,
    "amount": 9750000
  }
}
```

## 2. Get Revenue Trend
Retrieves time-series data for the Area Chart.

- **Endpoint:** `GET /stats/trend`
- **Query Parameters:**
  - `startDate`: `YYYY-MM-DD`
  - `endDate`: `YYYY-MM-DD`

- **Response Schema:**
```json
[
  {
    "date": "2024-01-01",
    "revenue": 1200000,
    "refund": 0
  },
  {
    "date": "2024-01-02",
    "revenue": 3500000,
    "refund": 100000
  }
  // ... ordered by date ascending
]
```

## 3. Get Payment Method Breakdown
Retrieves data for the Donut Chart.

- **Endpoint:** `GET /stats/payment-methods`
- **Query Parameters:**
  - `startDate`: `YYYY-MM-DD`
  - `endDate`: `YYYY-MM-DD`

- **Response Schema:**
```json
[
  {
    "method": "CARD",
    "label": "신용카드",
    "amount": 9750000,
    "percentage": 65.0,
    "color": "indigo.6" // Optional: UI hint
  },
  {
    "method": "TRANSFER",
    "label": "계좌이체",
    "amount": 4500000,
    "percentage": 30.0,
    "color": "teal.6"
  },
  {
    "method": "CASH",
    "label": "현금",
    "amount": 750000,
    "percentage": 5.0,
    "color": "gray.6"
  }
]
```

## 4. Get Transactions List
Retrieves detailed transaction logs for the bottom table.

- **Endpoint:** `GET /transactions`
- **Query Parameters:**
  - `page`: `number` (Default: 1)
  - `limit`: `number` (Default: 20)
  - `startDate`: `YYYY-MM-DD`
  - `endDate`: `YYYY-MM-DD`
  - `type`: `PAYMENT` | `REFUND` (Optional)

- **Response Schema:**
```json
{
  "data": [
    {
      "id": "TX_12345",
      "paidAt": "2024-01-15T14:30:00Z",
      "productName": "1:1 PT 10회 이용권",
      "memberName": "홍길동",
      "method": "CARD",
      "amount": 550000,
      "type": "PAYMENT", // 'PAYMENT' | 'REFUND'
      "status": "APPROVED"
    }
  ],
  "meta": {
    "total": 125,
    "page": 1,
    "limit": 20,
    "totalPages": 7
  }
}
```
