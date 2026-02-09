'use client';

import { Badge, BadgeProps } from '@mantine/core';
import { IconCheck, IconClock, IconX, IconCurrencyDollar } from '@tabler/icons-react';

type SalaryStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PAID';

interface SalaryStatusBadgeProps {
    status: SalaryStatus;
    size?: BadgeProps['size'];
}

const statusConfig: Record<SalaryStatus, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: {
        label: '미확정',
        color: 'orange',
        icon: <IconClock size={12} />
    },
    CONFIRMED: {
        label: '확정',
        color: 'teal',
        icon: <IconCheck size={12} />
    },
    CANCELLED: {
        label: '취소',
        color: 'red',
        icon: <IconX size={12} />
    },
    PAID: {
        label: '지급완료',
        color: 'blue',
        icon: <IconCurrencyDollar size={12} />
    }
};

export function SalaryStatusBadge({ status, size = 'sm' }: SalaryStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge
            size={size}
            color={config.color}
            variant="light"
            leftSection={config.icon}
        >
            {config.label}
        </Badge>
    );
}
