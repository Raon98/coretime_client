'use client';

import { useState } from 'react';
import {
    Title,
    Text,
    Container,
    Paper,
    Group,
    Button,
    Grid,
    Stack,
    Badge,
    Table,
    ThemeIcon,
    ActionIcon,
    Modal,
    Select,
    NumberInput,
    Box,
    Loader,
    Center,
    Timeline,
    Divider,
    SegmentedControl
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
    IconCurrencyDollar,
    IconHistory,
    IconPlus,
    IconCashBanknote,
    IconCalendarTime,
    IconArrowRight,
    IconEdit
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { salaryApi, CreateSalaryConfigCommand, SalaryType } from '@/lib/api';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';

export default function InstructorSalaryPage() {
    const params = useParams();
    const membershipId = Number(params.id);
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();

    // Fetch active config
    const { data: activeConfig, isLoading: isActiveLoading } = useQuery({
        queryKey: ['salary', 'config', 'active', membershipId],
        queryFn: () => salaryApi.getActiveConfig(membershipId),
    });

    // Fetch history
    const { data: history, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['salary', 'config', 'history', membershipId],
        queryFn: () => salaryApi.getConfigHistory(membershipId),
    });

    const createConfigMutation = useMutation({
        mutationFn: (command: CreateSalaryConfigCommand) => salaryApi.createConfig(command),
        onSuccess: () => {
            notifications.show({ title: '저장 완료', message: '급여 설정이 저장되었습니다.', color: 'teal' });
            queryClient.invalidateQueries({ queryKey: ['salary', 'config'] });
            close();
            form.reset();
        },
        onError: () => {
            notifications.show({ title: '오류 발생', message: '설정 저장 중 오류가 발생했습니다.', color: 'red' });
        }
    });

    const form = useForm({
        initialValues: {
            salaryType: 'HOURLY' as SalaryType,
            baseAmount: 0,
            effectiveFrom: new Date(),
        },
        validate: {
            baseAmount: (value) => (value < 0 ? '0원 이상 입력해주세요' : null),
        }
    });

    const handleSubmit = (values: typeof form.values) => {
        createConfigMutation.mutate({
            membershipId,
            salaryType: values.salaryType,
            baseAmount: values.baseAmount,
            effectiveFrom: dayjs(values.effectiveFrom).format('YYYY-MM-DD'),
        });
    };

    if (isActiveLoading || isHistoryLoading) {
        return <Center h={400}><Loader size="lg" /></Center>;
    }

    const typeLabels: Record<SalaryType, string> = {
        'HOURLY': '시급제',
        'GRAVITY': '비율제 (Gravity)',
        'PERCENTAGE': '비율제 (%)',
        'PER_SESSION': '건별 지급'
    };

    return (
        <Container size="xl" py="xl">
            <Stack gap="xl">
                {/* Header */}
                <Group justify="space-between" align="flex-end">
                    <div>
                        <Title order={2} fw={800} mb={4}>급여 설정 관리</Title>
                        <Text c="dimmed" size="sm">강사의 급여 지급 기준을 설정하고 이력을 관리합니다.</Text>
                    </div>
                </Group>

                <Grid>
                    {/* Left: Active Config & Actions */}
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <Paper p="xl" radius="md" withBorder h="100%" bg="white">
                            <Stack gap="lg">
                                <Group justify="space-between">
                                    <Group gap="xs">
                                        <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                                            <IconCashBanknote size={20} />
                                        </ThemeIcon>
                                        <Text size="lg" fw={700}>현재 적용 중인 설정</Text>
                                    </Group>
                                    {activeConfig && <Badge color="teal" variant="light">Active</Badge>}
                                </Group>

                                {activeConfig ? (
                                    <>
                                        <Box py="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)', borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                                            <Stack gap="md">
                                                <Group justify="space-between">
                                                    <Text c="dimmed">지급 유형</Text>
                                                    <Badge size="lg" variant="dot">{typeLabels[activeConfig.salaryType]}</Badge>
                                                </Group>
                                                <Group justify="space-between">
                                                    <Text c="dimmed">기본 금액/비율</Text>
                                                    <Text fw={800} size="xl" c="blue.7">
                                                        {activeConfig.salaryType === 'PERCENTAGE'
                                                            ? `${activeConfig.baseAmount}%`
                                                            : `${activeConfig.baseAmount.toLocaleString()}원`}
                                                    </Text>
                                                </Group>
                                                <Group justify="space-between">
                                                    <Text c="dimmed">적용 시작일</Text>
                                                    <Text fw={500}>{activeConfig.effectiveFrom}</Text>
                                                </Group>
                                            </Stack>
                                        </Box>
                                        <Button
                                            fullWidth
                                            size="md"
                                            leftSection={<IconEdit size={18} />}
                                            onClick={() => {
                                                form.setValues({
                                                    salaryType: activeConfig.salaryType,
                                                    baseAmount: activeConfig.baseAmount,
                                                    effectiveFrom: new Date()
                                                });
                                                open();
                                            }}
                                        >
                                            새로운 설정 적용
                                        </Button>
                                    </>
                                ) : (
                                    <Stack align="center" py="xl" gap="md">
                                        <Text c="dimmed">현재 적용된 급여 설정이 없습니다.</Text>
                                        <Button leftSection={<IconPlus size={18} />} onClick={open}>
                                            초기 급여 설정하기
                                        </Button>
                                    </Stack>
                                )}
                            </Stack>
                        </Paper>
                    </Grid.Col>

                    {/* Right: History Timeline */}
                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <Paper p="xl" radius="md" withBorder h="100%">
                            <Title order={4} mb="lg" c="dimmed">설정 변경 이력</Title>

                            {!history?.history.length ? (
                                <Center h={200}>
                                    <Text c="dimmed">변경 이력이 없습니다.</Text>
                                </Center>
                            ) : (
                                <Timeline active={0} bulletSize={24} lineWidth={2}>
                                    {history.history.map((item, index) => (
                                        <Timeline.Item
                                            key={item.id}
                                            bullet={index === 0 ? <IconCurrencyDollar size={12} /> : <IconHistory size={12} />}
                                            title={
                                                <Text fw={600} size="sm">
                                                    {typeLabels[item.salaryType]} - {item.baseAmount.toLocaleString()}{item.salaryType === 'PERCENTAGE' ? '%' : '원'}
                                                </Text>
                                            }
                                        >
                                            <Text c="dimmed" size="xs">
                                                적용 기간: {item.effectiveFrom} ~ {item.effectiveTo || '현재'}
                                            </Text>
                                            <Text size="xs" mt={4}>
                                                변경일: {item.createdAt ? dayjs(item.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
                                            </Text>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            )}
                        </Paper>
                    </Grid.Col>
                </Grid>

                {/* Create/Edit Modal */}
                <Modal
                    opened={opened}
                    onClose={close}
                    title="급여 설정"
                    centered
                >
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack>
                            <Text size="sm" fw={500} mt="xs">급여 지급 유형</Text>
                            <SegmentedControl
                                fullWidth
                                data={[
                                    { value: 'HOURLY', label: '시급제' },
                                    { value: 'PER_SESSION', label: '건별' },
                                    { value: 'PERCENTAGE', label: '비율제 (%)' }
                                ]}
                                {...form.getInputProps('salaryType')}
                            />

                            <NumberInput
                                label={form.values.salaryType === 'PERCENTAGE' ? '적용 비율 (%)' : '기본 금액 (원)'}
                                description={form.values.salaryType === 'PERCENTAGE' ? '매출의 몇 %를 지급할지 입력하세요.' : '시간/건당 지급액을 입력하세요.'}
                                placeholder="0"
                                thousandSeparator
                                suffix={form.values.salaryType === 'PERCENTAGE' ? '%' : ' 원'}
                                {...form.getInputProps('baseAmount')}
                            />

                            <DateInput
                                label="적용 시작일"
                                description="이 설정은 언제부터 적용되나요?"
                                placeholder="YYYY-MM-DD"
                                valueFormat="YYYY-MM-DD"
                                minDate={new Date()}
                                {...form.getInputProps('effectiveFrom')}
                            />

                            <Group justify="flex-end" mt="md">
                                <Button variant="light" onClick={close}>취소</Button>
                                <Button type="submit" loading={createConfigMutation.isPending}>저장하기</Button>
                            </Group>
                        </Stack>
                    </form>
                </Modal>
            </Stack>
        </Container>
    );
}
