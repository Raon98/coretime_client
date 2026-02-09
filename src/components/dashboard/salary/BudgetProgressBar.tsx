'use client';

import { Progress, ProgressProps } from '@mantine/core';

interface BudgetProgressBarProps {
    value: number; // 0-100
    size?: ProgressProps['size'];
}

export function BudgetProgressBar({ value, size = 'lg' }: BudgetProgressBarProps) {
    // Determine color based on percentage
    const getColor = (percentage: number): string => {
        if (percentage < 70) return 'teal';
        if (percentage < 90) return 'orange';
        return 'red';
    };

    const color = getColor(value);

    return (
        <Progress
            value={value}
            size={size}
            radius="md"
            color={color}
            animated={value > 90}
            striped={value > 90}
        />
    );
}
