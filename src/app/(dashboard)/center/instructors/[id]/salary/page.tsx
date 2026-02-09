'use client';

import { useState, use } from 'react';
import {
    Container,
    Title,
    Text,
    Button,
    Group,
    Paper,
    Stack,
    Grid,
    ThemeIcon,
    Badge,
    SegmentedControl,
    NumberInput,
    Divider,
    Timeline,
    Box,
    LoadingOverlay,
    Modal,
    Card,
    Center,
    Alert,
    ActionIcon,
    Tooltip
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';
import {
    IconCurrencyDollar,
    IconHistory,
    IconCalendar,
    IconCheck,
    IconClock,
    IconUser,
    IconPlus,
    IconInfoCircle,
    IconAlertCircle,
    IconArrowLeft
} from '@tabler/icons-react';
import { salaryApi, CreateSalaryConfigCommand, SalaryConfig, SalaryType } from '@/lib/api';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { useRouter } from 'next/navigation';

// Configure dayjs
dayjs.extend(relativeTime);
dayjs.locale('ko');

// Helper for labels in Korean
const typeInfo: Record<string, { label: string; color: string; icon: typeof IconClock; desc: string }> = {
    'HOURLY': {
        label: '시간당',
        color: 'indigo',
        icon: IconClock,
        desc: '실제 근무 시간(출퇴근 기록)을 기준으로 정산합니다.'
    },
    'PER_SESSION': {
        label: '회당',
        color: 'teal',
        icon: IconUser,
        desc: '완료된 수업 세션당 고정 금액을 지급합니다.'
    }
};

export default function InstructorSalaryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: membershipId } = use(params);
    const queryClient = useQueryClient();
    const router = useRouter();
    const [opened, { open, close }] = useDisclosure(false);

    // Fetch Active Config explicitly
    const { data: activeConfig, isLoading: isActiveLoading } = useQuery({
        queryKey: ['salary', 'config', 'active', membershipId],
        queryFn: () => salaryApi.getActiveConfig(membershipId),
        enabled: !!membershipId
    });

    // Fetch History
    const { data: configHistory = [], isLoading: isHistoryLoading } = useQuery({
        queryKey: ['salary', 'config', 'history', membershipId],
        queryFn: () => salaryApi.getConfigs(membershipId),
        enabled: !!membershipId
    });

    // Create Config Mutation
    const createMutation = useMutation({
        mutationFn: (command: CreateSalaryConfigCommand) => salaryApi.createConfig(command),
        onSuccess: () => {
            notifications.show({
                title: '설정 저장 완료',
                message: '새로운 급여 정산 모델이 성공적으로 적용되었습니다.',
                color: 'teal',
                icon: <IconCheck size={18} />,
            });
            // Invalidate both active and history
            queryClient.invalidateQueries({ queryKey: ['salary', 'config'] });
            close();
            form.reset();
        },
        onError: (error: any) => {
            console.error(error);
            notifications.show({
                title: '저장 실패',
                message: error?.response?.data?.error?.message || '설정을 저장하는 중 오류가 발생했습니다.',
                color: 'red',
                icon: <IconAlertCircle size={18} />,
            });
        }
    });

    const form = useForm<Omit<CreateSalaryConfigCommand, 'membershipId'>>({
        initialValues: {
            salaryType: 'HOURLY',
            baseAmount: 0,
            effectiveFrom: dayjs().format('YYYY-MM-DD'),
        },
        validate: {
            baseAmount: (value) => (value <= 0 ? '금액은 0보다 커야 합니다' : null),
            effectiveFrom: (value) => (!value ? '적용 시작일은 필수입니다' : null),
        }
    });

    const handleSubmit = (values: typeof form.values) => {
        createMutation.mutate({
            membershipId: membershipId as any, // Cast for API compat if needed, but we updated lib/api
            ...values,
            effectiveFrom: dayjs(values.effectiveFrom).format('YYYY-MM-DD'),
        });
    };

    const activeInfo = activeConfig ? typeInfo[activeConfig.salaryType] : null;

    if (!membershipId) {
        return (
            <Container size="md" py="xl">
                <Alert color="red" title="잘못된 요청">
                    강사 식별 정보가 없거나 유효하지 않습니다.
                </Alert>
            </Container>
        );
    }

    return (
        <Container size="lg" py="xl">
            {/* Minimal Header */}
            <Group justify="space-between" mb={30}>
                <Stack gap={4}>
                    <Group gap="xs">
                        <ActionIcon variant="subtle" color="gray" onClick={() => router.back()}>
                            <IconArrowLeft size={18} />
                        </ActionIcon>
                        <Title order={2} fw={700} style={{ fontSize: '1.5rem' }}>급여 정산 설정</Title>
                    </Group>
                    <Text c="dimmed" size="sm" ml={32}>강사의 정산 모델을 관리하고 이력을 확인합니다.</Text>
                </Stack>

                {/* <Button
                    variant="light"
                    color="indigo"
                    leftSection={<IconPlus size={16} />}
                    onClick={() => {
                        if (activeConfig) {
                            form.setValues({
                                salaryType: activeConfig.salaryType,
                                baseAmount: activeConfig.baseAmount,
                                effectiveFrom: dayjs().format('YYYY-MM-DD')
                            });
                        }
                        open();
                    }}
                >
                    새 정산 모델 등록
                </Button> */}
            </Group>

            <Grid gutter="xl">
                {/* Active Insight Card */}
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Card withBorder padding="lg" radius="md" style={{ borderTop: `4px solid var(--mantine-color-${activeInfo?.color || 'gray'}-5)` }}>
                        <Stack gap="lg">
                            <Group justify="space-between">
                                <Text fw={600} size="sm" c="dimmed">현재 적용 중인 모델</Text>
                                <Badge variant="dot" color={activeConfig ? 'green' : 'gray'}>
                                    {activeConfig ? '활성' : '미설정'}
                                </Badge>
                            </Group>

                            {activeConfig ? (
                                <>
                                    <Group align="flex-start" justify="space-between" wrap="nowrap">
                                        <div>
                                            <Text fw={800} size="xl" style={{ fontSize: '2rem' }}>
                                                ₩{activeConfig.baseAmount.toLocaleString()}
                                            </Text>
                                            <Group gap={4} mt={4}>
                                                <ThemeIcon size="xs" variant="transparent" color={activeInfo?.color}>
                                                    {activeInfo && <activeInfo.icon size={14} />}
                                                </ThemeIcon>
                                                <Text size="sm" fw={600} c={activeInfo?.color}>{activeInfo?.label}</Text>
                                                <Text size="xs" c="dimmed">정산 방식</Text>
                                            </Group>
                                        </div>
                                        <Tooltip label={activeInfo?.desc} multiline w={220} withArrow>
                                            <ActionIcon variant="subtle" color="gray" radius="xl">
                                                <IconInfoCircle size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Group>

                                    <Divider variant="dashed" />

                                    <Grid gutter="sm">
                                        <Grid.Col span={6}>
                                            <Text size="xs" c="dimmed" fw={600} mb={4}>적용 시작일</Text>
                                            <Group gap={6}>
                                                <IconCalendar size={14} color="gray" />
                                                <Text size="sm" fw={500}>{dayjs(activeConfig.effectiveFrom).format('YYYY-MM-DD')}</Text>
                                            </Group>
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <Text size="xs" c="dimmed" fw={600} mb={4}>적용 경과</Text>
                                            <Text size="sm" fw={500}>{dayjs(activeConfig.effectiveFrom).fromNow()}</Text>
                                        </Grid.Col>
                                    </Grid>
                                </>
                            ) : (
                                <Center py={40}>
                                    <Stack align="center" gap="xs">
                                        <ThemeIcon size={48} radius="xl" color="gray" variant="light">
                                            <IconCurrencyDollar size={24} />
                                        </ThemeIcon>
                                        <Text size="sm" c="dimmed">적용된 정산 정보가 없습니다.</Text>
                                        <Button variant="subtle" size="xs" mt="sm" onClick={open}>설정 추가하기</Button>
                                    </Stack>
                                </Center>
                            )}
                        </Stack>
                    </Card>

                    <Paper withBorder p="md" radius="md" mt="md" bg="gray.0">
                        <Group gap="sm" wrap="nowrap" align="flex-start">
                            <ThemeIcon variant="light" color="indigo" size="sm">
                                <IconInfoCircle size={14} />
                            </ThemeIcon>
                            <Text size="xs" c="dimmed" lh={1.6}>
                                급여 정산 모델은 수업료 계산의 기준이 되며, 새로운 설정이 등록되면 기존 설정은 자동으로 종료일이 지정됩니다.
                            </Text>
                        </Group>
                    </Paper>
                </Grid.Col>

                {/* History Timeline */}
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Stack gap="md">
                        <Group justify="space-between">
                            <Text fw={700} size="md">기본 정산 이력</Text>
                            <Badge variant="light" color="gray">{configHistory?.length || 0}개 기록</Badge>
                        </Group>

                        <Paper withBorder p="xl" radius="md" styles={{ root: { position: 'relative' } }}>
                            <LoadingOverlay visible={isHistoryLoading} overlayProps={{ blur: 1 }} />

                            {(!configHistory || configHistory.length === 0) ? (
                                <Center h={150}>
                                    <Text size="sm" c="dimmed">변경 이력이 존재하지 않습니다.</Text>
                                </Center>
                            ) : (
                                <Timeline active={0} bulletSize={12} lineWidth={2} ml={10}>
                                    {configHistory.map((config, index) => (
                                        <Timeline.Item
                                            key={config.id}
                                            bullet={config.isActive ? <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--mantine-color-green-6)' }} /> : null}
                                        >
                                            <Group justify="space-between" align="flex-start">
                                                <Stack gap={2}>
                                                    <Group gap="xs">
                                                        <Text fw={600} size="sm">
                                                            {typeInfo[config.salaryType]?.label}정산
                                                        </Text>
                                                        <Text fw={700} size="sm" c="indigo">
                                                            ₩{config.baseAmount.toLocaleString()}
                                                        </Text>
                                                        {config.isActive && <Badge size="xs" color="green" variant="light">현재 적용</Badge>}
                                                    </Group>
                                                    <Text size="xs" c="dimmed">
                                                        {dayjs(config.effectiveFrom).format('YYYY.MM.DD')}
                                                        {config.effectiveTo ? ` ~ ${dayjs(config.effectiveTo).format('YYYY.MM.DD')}` : ' ~ 현재'}
                                                    </Text>
                                                </Stack>
                                                <Text size="xs" c="dimmed">
                                                    {dayjs(config.createdAt).format('MM.DD HH:mm')}
                                                </Text>
                                            </Group>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            )}
                        </Paper>
                    </Stack>
                </Grid.Col>
            </Grid>

            {/* Config Modal */}
            <Modal
                opened={opened}
                onClose={close}
                title={<Text fw={700}>정산 모델 변경</Text>}
                centered
                size="sm"
                padding="lg"
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <Box>
                            <Text fw={600} size="xs" mb={8} c="dimmed">정산 방식</Text>
                            <SegmentedControl
                                fullWidth
                                size="sm"
                                color="indigo"
                                data={[
                                    { value: 'HOURLY', label: '시간당 정산' },
                                    { value: 'PER_SESSION', label: '회당 정산' }
                                ]}
                                value={form.values.salaryType}
                                onChange={(val) => form.setFieldValue('salaryType', val as SalaryType)}
                            />
                        </Box>

                        <Box>
                            <Text fw={600} size="xs" mb={8} c="dimmed">지급 금액 (₩)</Text>
                            <NumberInput
                                size="sm"
                                placeholder="금액을 입력하세요"
                                thousandSeparator
                                min={0}
                                hideControls
                                {...form.getInputProps('baseAmount')}
                            />
                            <Text size="xs" c="dimmed" mt={4}>
                                {form.values.salaryType === 'HOURLY' ? '시간당 단가를 입력합니다.' : '수업 1회 완료 시 지급되는 단가입니다.'}
                            </Text>
                        </Box>

                        <Box>
                            <Text fw={600} size="xs" mb={8} c="dimmed">적용 시작일</Text>
                            <DatePickerInput
                                size="sm"
                                placeholder="날짜 선택"
                                locale="ko"
                                valueFormat="YYYY.MM.DD"
                                value={dayjs(form.values.effectiveFrom).toDate()}
                                onChange={(date) => form.setFieldValue('effectiveFrom', dayjs(date).format('YYYY-MM-DD'))}
                            />
                        </Box>

                        <Group justify="flex-end" mt="lg">
                            <Button variant="subtle" color="gray" size="sm" onClick={close}>취소</Button>
                            <Button
                                color="indigo"
                                size="sm"
                                type="submit"
                                loading={createMutation.isPending}
                            >
                                저장하기
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Container>
    );
}
