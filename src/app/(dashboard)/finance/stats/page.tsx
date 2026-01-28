'use client';

import {
    Title, Text, Container, Grid, Paper, Group,
    ThemeIcon, Table, Badge, Stack, Divider, SegmentedControl, Avatar
} from '@mantine/core';
import {
    IconTrendingUp, IconTrendingDown, IconCreditCard,
    IconReceipt, IconCalendar, IconArrowUpRight, IconArrowDownRight, IconCoin
} from '@tabler/icons-react';
import { useFinance } from '@/context/FinanceContext';
import { AreaChart, DonutChart } from '@mantine/charts';
import { MonthPickerInput } from '@mantine/dates';
import { useState } from 'react';
import dayjs from 'dayjs';

export default function FinanceStatsPage() {
    const { transactions } = useFinance();
    const [dateValue, setDateValue] = useState<Date | null>(new Date());
    const [period, setPeriod] = useState('daily');

    // --- Mock Data Generation for Visuals (Aggregate from real tx if possible, but mocking for demo stability) ---
    // In a real scenario, these would come from the API based on the selected month.

    // 1. Summary Metrics
    const totalSales = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const refundAmount = 0; // Mock refund
    const netSales = totalSales - refundAmount;
    const previousMonthSales = totalSales * 0.9; // Mock: 10% growth
    const growthRate = ((totalSales - previousMonthSales) / previousMonthSales) * 100;

    // 2. Trend Data (Area Chart)
    // Generating dummy daily data for the selected month
    const trendData = Array.from({ length: 15 }, (_, i) => ({
        date: `${dayjs().format('M')}/${i * 2 + 1}`,
        매출: Math.floor(Math.random() * 1000000) + 500000,
        환불: Math.floor(Math.random() * 100000)
    }));

    // 3. Payment Method Data (Donut Chart)
    const cardTotal = transactions.filter(tx => tx.method === 'CARD').reduce((sum, tx) => sum + tx.amount, 0);
    const cashTotal = transactions.filter(tx => tx.method === 'CASH').reduce((sum, tx) => sum + tx.amount, 0);
    const transferTotal = transactions.filter(tx => tx.method === 'TRANSFER').reduce((sum, tx) => sum + tx.amount, 0);

    // Ensure we have some data for the chart even if transactions are empty
    const paymentData = [
        { name: '신용카드', value: cardTotal || 3500000, color: 'indigo.6' },
        { name: '계좌이체', value: transferTotal || 1200000, color: 'teal.6' },
        { name: '현금', value: cashTotal || 300000, color: 'gray.6' },
    ];

    return (
        <Container size="xl" py="xl">
            {/* Header: Title & Controls */}
            <Group justify="space-between" mb="lg" align="flex-end">
                <div>
                    <Title order={2}>매출 통계</Title>
                    <Text c="dimmed" size="sm">기간별 매출 현황 및 추이를 확인합니다.</Text>
                </div>
                <Group>
                    <SegmentedControl
                        value={period}
                        onChange={setPeriod}
                        data={[
                            { label: '일간', value: 'daily' },
                            { label: '월간', value: 'monthly' }
                        ]}
                    />
                    <MonthPickerInput
                        placeholder="기간 선택"
                        leftSection={<IconCalendar size={16} />}
                        value={dateValue}
                        onChange={(date: any) => setDateValue(date)}
                        w={150}
                    />
                </Group>
            </Group>

            {/* 1. Dashboard Summary Strip (Practical, "Substantial" look) */}
            <Paper shadow="sm" radius="md" p="lg" withBorder mb="lg" bg="var(--mantine-color-body)">
                <Grid gutter="xl">
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }} style={{ borderRight: '1px solid var(--mantine-color-gray-2)' }}>
                        <StatItem
                            label="총 매출액"
                            value={totalSales}
                            icon={IconCoin}
                            color="blue"
                            trend={+12.5}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }} style={{ borderRight: '1px solid var(--mantine-color-gray-2)' }}>
                        <StatItem
                            label="실 결제액 (순매출)"
                            value={netSales}
                            icon={IconTrendingUp}
                            color="indigo"
                            desc="환불 제외"
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }} style={{ borderRight: '1px solid var(--mantine-color-gray-2)' }}>
                        <StatItem
                            label="환불 금액"
                            value={refundAmount}
                            icon={IconTrendingDown}
                            color="red"
                            isCurrency
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Text c="dimmed" size="xs" fw={700} tt="uppercase">결제 수단 비중 1위</Text>
                        <Group mt="xs">
                            <ThemeIcon variant="light" color="indigo" size="lg"><IconCreditCard size={20} /></ThemeIcon>
                            <div>
                                <Text fw={700} size="md">신용카드</Text>
                                <Text size="xs" c="dimmed">전체 65%</Text>
                            </div>
                        </Group>
                    </Grid.Col>
                </Grid>
            </Paper>

            {/* 2. Main Analytics Area */}
            <Grid gutter="lg" mb="lg">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper shadow="sm" radius="md" p="lg" withBorder h="100%">
                        <Group justify="space-between" mb="md">
                            <Text fw={700} size="lg">매출 추이</Text>
                            <Badge variant="light" color="gray">단위: 원</Badge>
                        </Group>
                        <AreaChart
                            h={300}
                            data={trendData}
                            dataKey="date"
                            series={[
                                { name: '매출', color: 'indigo.6' },
                                { name: '환불', color: 'red.6' },
                            ]}
                            curveType="monotone"
                            gridAxis="xy"
                            tickLine="y"
                            withLegend
                            legendProps={{ verticalAlign: 'top', height: 30 }}
                        />
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper shadow="sm" radius="md" p="lg" withBorder h="100%">
                        <Text fw={700} size="lg" mb="md">결제 수단별 비중</Text>
                        <Group justify="center" mb="xl">
                            <DonutChart
                                size={180}
                                thickness={20}
                                paddingAngle={2}
                                data={paymentData}
                                withTooltip
                                tooltipDataSource="segment"
                            />
                        </Group>
                        <Stack gap="xs">
                            {paymentData.map((item) => (
                                <Group key={item.name} justify="space-between">
                                    <Group gap="xs">
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: `var(--mantine-color-${item.color})` }} />
                                        <Text size="sm">{item.name}</Text>
                                    </Group>
                                    <Text size="sm" fw={500}>{item.value.toLocaleString()}원</Text>
                                </Group>
                            ))}
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* 3. Detailed Transaction Log */}
            <Paper shadow="sm" radius="md" p="lg" withBorder>
                <Group justify="space-between" mb="md">
                    <Text fw={700} size="lg">상세 매출 내역</Text>
                </Group>
                <Table horizontalSpacing="md" verticalSpacing="sm" highlightOnHover>
                    <Table.Thead bg="gray.0">
                        <Table.Tr>
                            <Table.Th>승인일시</Table.Th>
                            <Table.Th>상품명</Table.Th>
                            <Table.Th>회원명</Table.Th>
                            <Table.Th>결제수단</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>금액</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>상태</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {transactions.slice(0, 10).map((tx) => (
                            <Table.Tr key={tx.id}>
                                <Table.Td>{dayjs(tx.paidAt).format('YYYY-MM-DD HH:mm')}</Table.Td>
                                <Table.Td fw={500}>{tx.productName}</Table.Td>
                                <Table.Td>{tx.memberName}</Table.Td>
                                <Table.Td>
                                    <Badge variant="dot" color={tx.method === 'CARD' ? 'indigo' : 'teal'}>
                                        {tx.method === 'CARD' ? '카드' : tx.method === 'TRANSFER' ? '이체' : '현금'}
                                    </Badge>
                                </Table.Td>
                                <Table.Td style={{ textAlign: 'right' }}>{tx.amount.toLocaleString()}원</Table.Td>
                                <Table.Td style={{ textAlign: 'center' }}>
                                    {/* Assuming all are PAYMENT for now given the mock model */}
                                    <Badge size="sm" variant="light" color={'green'}>
                                        승인
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                        {transactions.length === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={6} align="center" py="xl" c="dimmed">매출 내역이 없습니다.</Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Paper>
        </Container>
    );
}

// Helper: Dashboard Stat Item
function StatItem({ label, value, icon: Icon, color, trend, desc }: any) {
    return (
        <Stack gap={4}>
            <Group justify="space-between" align="flex-start">
                <Text c="dimmed" size="xs" fw={700} tt="uppercase">{label}</Text>
                <ThemeIcon variant="light" color={color} radius="md" size="lg">
                    <Icon size={18} />
                </ThemeIcon>
            </Group>

            <Group align="flex-end" gap="xs">
                <Text fw={700} size="xl" style={{ lineHeight: 1 }}>{value.toLocaleString()}원</Text>
            </Group>

            {trend !== undefined && (
                <Group gap={4} mt={4}>
                    <ThemeIcon color={trend >= 0 ? 'teal' : 'red'} variant="transparent" size="xs">
                        {trend >= 0 ? <IconArrowUpRight /> : <IconArrowDownRight />}
                    </ThemeIcon>
                    <Text c={trend >= 0 ? 'teal' : 'red'} size="xs" fw={600}>
                        {Math.abs(trend)}%
                    </Text>
                    <Text c="dimmed" size="xs">전월 대비</Text>
                </Group>
            )}

            {desc && <Text c="dimmed" size="xs" mt={4}>{desc}</Text>}
        </Stack>
    );
}
