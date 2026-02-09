'use client';

import { useState } from 'react';
import {
    Title,
    Text,
    Container,
    Paper,
    Group,
    RingProgress,
    Stack,
    Center,
    Button,
    Modal,
    NumberInput,
    Grid,
    ThemeIcon,
    Loader,
    NumberFormatter,
    Box,
    Divider,
    Select
} from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useDisclosure } from '@mantine/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconSettings, IconCoin, IconAlertTriangle, IconTrendingUp } from '@tabler/icons-react';
import { salaryApi, CreateBudgetCommand } from '@/lib/api';
import dayjs from 'dayjs';
import { notifications } from '@mantine/notifications';

export default function SalaryBudgetPage() {
    const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));

    // Fetch available months for payment from backend
    const { data: availableMonths = [] } = useQuery({
        queryKey: ['salary', 'available-months'],
        queryFn: () => salaryApi.getAvailableMonths(),
    });

    const months = availableMonths.length > 0
        ? availableMonths.map(m => ({ value: m, label: dayjs(m).format('YYYY년 MM월') }))
        : Array.from({ length: 12 }, (_, i) => {
            const d = dayjs().subtract(i, 'month');
            return { value: d.format('YYYY-MM'), label: d.format('YYYY년 MM월') };
        });
    const [opened, { open, close }] = useDisclosure(false);
    const [newBudget, setNewBudget] = useState<number | ''>('');
    const queryClient = useQueryClient();

    // Fetch budget data
    const { data: budget, isLoading } = useQuery({
        queryKey: ['salary', 'budget', selectedMonth],
        queryFn: () => salaryApi.getBudget(selectedMonth),
    });

    // Update budget mutation
    const updateBudgetMutation = useMutation({
        mutationFn: (command: CreateBudgetCommand) => salaryApi.updateBudget(command),
        onSuccess: () => {
            notifications.show({ title: '예산 설정 완료', message: '이번 달 예산이 설정되었습니다.', color: 'teal' });
            queryClient.invalidateQueries({ queryKey: ['salary', 'budget'] });
            close();
        }
    });

    const handleUpdateBudget = () => {
        if (typeof newBudget === 'number') {
            updateBudgetMutation.mutate({
                month: selectedMonth,
                plannedBudget: newBudget
            });
        }
    };

    if (isLoading) {
        return <Center h={400}><Loader size="lg" /></Center>;
    }

    // Colors based on status
    const statusColor = budget?.status === 'EXCEEDED' ? 'red' : budget?.status === 'WARNING' ? 'orange' : 'teal';
    const percent = budget?.usageRate || 0;

    // Mock trend data for chart if API not ready, or transform actual data
    const trendData = [
        { month: '2023-05', budget: 10, actual: 8 },
        { month: '2023-06', budget: 10, actual: 9 },
        { month: '2023-07', budget: 12, actual: 11 },
        { month: '2023-08', budget: 12, actual: 10 },
        { month: '2023-09', budget: 15, actual: 14 },
        { month: '2023-10', budget: 15, actual: percent > 100 ? 16 : 12 }, // Dynamic based on current state
    ];

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl" align="flex-end">
                <div>
                    <Title order={2} fw={800} mb={4}>예산 관리</Title>
                    <Text c="dimmed" size="sm">{dayjs(selectedMonth).format('YYYY년 MM월')} 급여 예산 및 지출 현황입니다.</Text>
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
                        leftSection={<IconSettings size={16} />}
                        onClick={() => {
                            setNewBudget(budget?.plannedBudget || '');
                            open();
                        }}
                    >
                        예산 설정
                    </Button>
                </Group>
            </Group>

            {/* Dashboard Grid */}
            <Grid gutter="xl">
                {/* Left: Current Month Status Circle */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper p="xl" radius="md" withBorder h="100%">
                        <Stack align="center" justify="center" h="100%">
                            <Text fw={600} size="lg" mb="md">이번 달 예산 소진율</Text>
                            <RingProgress
                                size={220}
                                thickness={16}
                                roundCaps
                                sections={[{ value: percent, color: statusColor }]}
                                label={
                                    <Center>
                                        <Stack gap={0} align="center">
                                            <Text fw={800} size="xl" fz={32}>
                                                {percent.toFixed(1)}%
                                            </Text>
                                            <Text size="xs" c="dimmed" fw={700}>
                                                {budget?.status === 'EXCEEDED' ? '초과됨' : budget?.status === 'WARNING' ? '주의' : '안전'}
                                            </Text>
                                        </Stack>
                                    </Center>
                                }
                            />
                            <Group mt="lg">
                                <Box>
                                    <Text size="xs" c="dimmed" ta="center">총 예산</Text>
                                    <Text fw={700}>
                                        <NumberFormatter value={budget?.plannedBudget || 0} thousandSeparator suffix="원" />
                                    </Text>
                                </Box>
                                <Divider orientation="vertical" />
                                <Box>
                                    <Text size="xs" c="dimmed" ta="center">지출 예상</Text>
                                    <Text fw={700} c={statusColor}>
                                        {/* Using plannedBudget * usageRate for total expected roughly, or specific field if available */}
                                        <NumberFormatter value={(budget?.confirmedSpent || 0) + (budget?.pendingSpent || 0)} thousandSeparator suffix="원" />
                                    </Text>
                                </Box>
                            </Group>
                        </Stack>
                    </Paper>
                </Grid.Col>

                {/* Right: Trend Chart & Breakdown */}
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="xl">
                        {/* Breakdown Cards */}
                        <Group grow>
                            <Paper p="md" radius="md" withBorder bg="gray.0">
                                <Group align="center">
                                    <ThemeIcon size="lg" radius="md" color="teal" variant="light">
                                        <IconCoin size={20} />
                                    </ThemeIcon>
                                    <div>
                                        <Text size="xs" c="dimmed" fw={700}>확정 지출</Text>
                                        <Text fw={700} size="xl">
                                            <NumberFormatter value={budget?.confirmedSpent || 0} thousandSeparator suffix="원" />
                                        </Text>
                                    </div>
                                </Group>
                            </Paper>
                            <Paper p="md" radius="md" withBorder bg="gray.0">
                                <Group align="center">
                                    <ThemeIcon size="lg" radius="md" color="orange" variant="light">
                                        <IconTrendingUp size={20} />
                                    </ThemeIcon>
                                    <div>
                                        <Text size="xs" c="dimmed" fw={700}>미확정(예상) 지출</Text>
                                        <Text fw={700} size="xl">
                                            <NumberFormatter value={budget?.pendingSpent || 0} thousandSeparator suffix="원" />
                                        </Text>
                                    </div>
                                </Group>
                            </Paper>
                            <Paper p="md" radius="md" withBorder bg="gray.0">
                                <Group align="center">
                                    <ThemeIcon size="lg" radius="md" color="blue" variant="light">
                                        <IconCoin size={20} />
                                    </ThemeIcon>
                                    <div>
                                        <Text size="xs" c="dimmed" fw={700}>잔여 예산</Text>
                                        <Text fw={700} size="xl">
                                            <NumberFormatter value={(budget?.plannedBudget || 0) - ((budget?.confirmedSpent || 0) + (budget?.pendingSpent || 0))} thousandSeparator suffix="원" />
                                        </Text>
                                    </div>
                                </Group>
                            </Paper>
                        </Group>

                        {/* Trend Chart */}
                        <Paper p="lg" radius="md" withBorder h={300}>
                            <Title order={4} mb="lg">최근 6개월 지출 추이 (단위: 백만원)</Title>
                            <BarChart
                                h={220}
                                data={trendData}
                                dataKey="month"
                                series={[
                                    { name: 'budget', color: 'gray.4', label: '예산' },
                                    { name: 'actual', color: 'blue.6', label: '실제 지출' },
                                ]}
                                tickLine="none"
                                gridAxis="xy"
                            />
                        </Paper>
                    </Stack>
                </Grid.Col>
            </Grid>

            {/* Set Budget Modal */}
            <Modal opened={opened} onClose={close} title="월간 예산 설정" centered>
                <Stack>
                    <Text size="sm">
                        {dayjs(selectedMonth).format('YYYY년 MM월')}의 목표 급여 예산을 설정합니다.
                    </Text>
                    <NumberInput
                        label="예산 금액"
                        placeholder="예: 10,000,000"
                        value={newBudget}
                        onChange={(val) => setNewBudget(Number(val))}
                        thousandSeparator
                        rightSection={<Text size="xs" c="dimmed" mr="xs">원</Text>}
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={close}>취소</Button>
                        <Button onClick={handleUpdateBudget}>저장</Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}

// Helper: Simple Divider replacement import from mantine
import { Divider as MantineDivider } from '@mantine/core'; // Not used but good to have if needed
