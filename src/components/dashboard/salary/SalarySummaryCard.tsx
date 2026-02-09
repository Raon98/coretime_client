'use client';

import { Card, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { ReactNode } from 'react';

interface SalarySummaryCardProps {
    title: string;
    amount: number;
    icon: ReactNode;
    color: string;
    percentage?: number;
    description?: string;
}

export function SalarySummaryCard({
    title,
    amount,
    icon,
    color,
    percentage,
    description
}: SalarySummaryCardProps) {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
                <Group justify="space-between">
                    <Text size="sm" c="dimmed" fw={600}>
                        {title}
                    </Text>
                    <ThemeIcon size="lg" radius="md" variant="light" color={color}>
                        {icon}
                    </ThemeIcon>
                </Group>

                <div>
                    <Text size="32px" fw={700} style={{ lineHeight: 1 }}>
                        {amount.toLocaleString()}원
                    </Text>
                    {percentage !== undefined && (
                        <Text size="xs" c="dimmed" mt={4}>
                            {description || `${percentage}%`}
                        </Text>
                    )}
                </div>
            </Stack>
        </Card>
    );
}
