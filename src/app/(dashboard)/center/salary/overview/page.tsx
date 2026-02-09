'use client';

import { useState } from 'react';
import {
    Title,
    Text,
    Group,
    Paper,
    Table,
    Button,
    Select,
    Container,
    Badge,
    ActionIcon,
    Menu,
    Stack,
    Divider,
    Box,
    Loader,
    Center,
    NumberFormatter,
    ThemeIcon,
    Grid
} from '@mantine/core';
import {
    IconDownload,
    IconDotsVertical,
    IconFileText,
    IconTrendingUp,
    IconTrendingDown,
    IconCoin,
    IconCalendarDollar,
    IconArrowRight,
    IconSearch,
    IconRefresh
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { salaryApi, CalculationDetail } from '@/lib/api';
import dayjs from 'dayjs';

export default function SalaryOverviewPage() {
    const [selectedMonth, setSelectedMonth] = useState<string>(dayjs().format('YYYY-MM'));

    // Fetch salary overview data
    const { data: overview, isLoading } = useQuery({
        queryKey: ['salary', 'overview', selectedMonth],
        queryFn: () => salaryApi.getSalaryOverview(1, selectedMonth), // Hardcoded membershipId 1 for now as per API spec example
    });

    // Fetch available months for payment from backend
    const { data: availableMonths = [] } = useQuery({
        queryKey: ['salary', 'available-months'],
        queryFn: () => salaryApi.getAvailableMonths(),
    });

    const months = availableMonths.length > 0
        ? availableMonths.map((m: string) => ({ value: m, label: dayjs(m).format('YYYY년 MM월') }))
        : Array.from({ length: 12 }, (_, i) => {
            const d = dayjs().subtract(i, 'month');
            return { value: d.format('YYYY-MM'), label: d.format('YYYY년 MM월') };
        });

    if (isLoading) {
        return (
            <Center h={400}>
                <Loader size="lg" />
            </Center>
        );
    }

    // Modern Metric Item Component
    const MetricItem = ({ label, value, subtext, color = 'blue' }: { label: string, value: number, subtext?: string, color?: string }) => (
        <Box>
            <Text c="dimmed" size="xs" tt="uppercase" fw={700} mb={4}>
                {label}
            </Text>
            <Group gap={8} align="baseline">
                <Text fw={700} size="xl" style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}>
                    <NumberFormatter value={value} thousandSeparator suffix="원" />
                </Text>
            </Group>
            {subtext && <Text size="xs" c="dimmed" mt={2}>{subtext}</Text>}
        </Box>
    );

    return (
        <Container size="xl" py="xl">
            {/* Header Section */}
            <Group justify="space-between" mb="xl" align="flex-end">
                <div>
                    <Title order={2} fw={800} mb={4}>급여 현황</Title>
                    <Text c="dimmed" size="sm">월별 강사 급여 지급 현황 및 내역을 조회합니다.</Text>
                </div>
                <Group>
                    <Select
                        value={selectedMonth}
                        onChange={(v) => v && setSelectedMonth(v)}
                        data={months}
                        w={150}
                        styles={{ input: { fontWeight: 500 } }}
                    />
                    <Button
                        variant="light"
                        leftSection={<IconDownload size={16} />}
                        disabled={!overview?.details?.length}
                    >
                        엑셀 다운로드
                    </Button>
                </Group>
            </Group>

            {/* Key Metrics Strip - Clean & Professional */}
            <Paper p="lg" radius="md" withBorder mb="xl" bg="gray.0">
                <Grid>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <MetricItem
                            label="총 지급 예정 금액"
                            value={overview?.finalAmount || 0}
                            subtext="확정된 급여와 미확정 급여의 합계입니다."
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Box style={{ borderLeft: '1px solid var(--mantine-color-gray-3)', paddingLeft: '24px' }}>
                            <MetricItem
                                label="확정된 급여"
                                value={overview?.totalConfirmedAmount || 0}
                                color="teal"
                            />
                        </Box>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Box style={{ borderLeft: '1px solid var(--mantine-color-gray-3)', paddingLeft: '24px' }}>
                            <MetricItem
                                label="조정 금액"
                                value={overview?.totalAdjustmentAmount || 0}
                                color="orange"
                            />
                        </Box>
                    </Grid.Col>
                </Grid>
            </Paper>

            {/* Instructor List Table */}
            <Paper radius="md" withBorder style={{ overflow: 'hidden' }}>
                <Group px="md" py="sm" justify="space-between" bg="white">
                    <Text fw={600} size="sm">상세 내역</Text>
                    <Group gap="xs">
                        <Button variant="subtle" size="xs" leftSection={<IconRefresh size={14} />}>새로고침</Button>
                    </Group>
                </Group>
                <Divider />
                <Table horizontalSpacing="lg" verticalSpacing="md" highlightOnHover>
                    <Table.Thead bg="gray.0">
                        <Table.Tr>
                            <Table.Th>일자</Table.Th>
                            <Table.Th>수업명</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>기본급</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>배율</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>산정 금액</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>상태</Table.Th>
                            <Table.Th style={{ width: '80px' }}></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {(!overview?.details || overview.details.length === 0) ? (
                            <Table.Tr>
                                <Table.Td colSpan={7}>
                                    <Center py="xl">
                                        <Text c="dimmed">해당 월의 급여 데이터가 없습니다.</Text>
                                    </Center>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            overview.details.map((item: CalculationDetail) => (
                                <Table.Tr key={item.id}>
                                    <Table.Td>
                                        <Text fw={500} size="sm">{item.sessionDate || '-'}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text fw={600} size="sm">{item.className || '수업'}</Text>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>
                                        <Text c="dimmed" size="sm">
                                            <NumberFormatter value={item.baseAmount} thousandSeparator suffix="원" />
                                        </Text>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>
                                        <Badge variant="light" color="gray">x{item.multiplier}</Badge>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>
                                        <Text fw={700}>
                                            <NumberFormatter value={item.calculatedAmount} thousandSeparator suffix="원" />
                                        </Text>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'center' }}>
                                        <Badge
                                            color={item.status === 'CONFIRMED' ? 'teal' : item.status === 'CANCELLED' ? 'red' : 'orange'}
                                            variant="dot"
                                        >
                                            {item.status}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <ActionIcon variant="subtle" color="gray">
                                            <IconDotsVertical size={16} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>
            </Paper>
        </Container>
    );
}
