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
    Box,
    Loader,
    Center,
    NumberFormatter,
    Modal,
    TextInput,
    NumberInput,
    SegmentedControl
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
    IconPlus,
    IconDotsVertical,
    IconCurrencyDollar,
    IconCheck,
    IconX,
    IconReceipt,
    IconCalendar,
    IconUser
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryApi, instructorApi, SalaryPaymentStatus, CreateSalaryPaymentCommand } from '@/lib/api'; // Corrected import
import dayjs from 'dayjs';

export default function SalaryPaymentsPage() {
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(dayjs().format('YYYY-MM'));
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();

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

    // Fetch payments
    const { data: payments, isLoading } = useQuery({
        queryKey: ['salary', 'payments', selectedMonth, selectedStatus],
        queryFn: () => salaryApi.getPayments({
            month: selectedMonth || undefined,
            status: selectedStatus as SalaryPaymentStatus
        }),
    });

    const { data: instructors } = useQuery({
        queryKey: ['instructors', 'list'],
        queryFn: () => instructorApi.getInstructors({}),
    });

    const createMutation = useMutation({
        mutationFn: (command: CreateSalaryPaymentCommand) => salaryApi.createPayment(command),
        onSuccess: () => {
            notifications.show({
                title: '지급 건 생성 완료',
                message: '새로운 급여 지급 건이 생성되었습니다.',
                color: 'teal',
            });
            queryClient.invalidateQueries({ queryKey: ['salary', 'payments'] });
            close();
            form.reset();
        },
        onError: () => {
            notifications.show({
                title: '오류 발생',
                message: '지급 건 생성 중 오류가 발생했습니다.',
                color: 'red',
            });
        }
    });

    const approveMutation = useMutation({
        mutationFn: (paymentId: string | number) => salaryApi.approvePayment(paymentId),
        onSuccess: () => {
            notifications.show({
                title: '승인 완료',
                message: '급여 지급 건이 성공적으로 승인되었습니다.',
                color: 'teal',
            });
            queryClient.invalidateQueries({ queryKey: ['salary', 'payments'] });
        },
        onError: () => {
            notifications.show({
                title: '승인 실패',
                message: '지급 건 승인 중 오류가 발생했습니다.',
                color: 'red',
            });
        }
    });

    const form = useForm({
        initialValues: {
            instructorId: '' as string, // String for Large ID support
            month: dayjs().toDate(),
            adjustmentAmount: 0,
            memo: '',
        },
        validate: {
            instructorId: (value) => !value ? '강사를 선택해주세요' : null,
            month: (value) => !value ? '지급 월을 선택해주세요' : null,
        }
    });

    const handleSubmit = (values: typeof form.values) => {
        if (!values.instructorId) return;
        createMutation.mutate({
            instructorMembershipId: values.instructorId, // Pass as string directly
            month: dayjs(values.month).format('YYYY-MM'),
        });
    };

    if (isLoading) {
        return (
            <Center h={400}>
                <Loader size="lg" />
            </Center>
        );
    }

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl" align="flex-end">
                <div>
                    <Title order={2} fw={800} mb={4}>급여 지급</Title>
                    <Text c="dimmed" size="sm">확정된 급여에 대한 지급 내역을 생성하고 관리합니다.</Text>
                </div>
                <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={open}
                    color="blue"
                >
                    새 지급 건 생성
                </Button>
            </Group>

            {/* Filters */}
            <Paper p="md" radius="md" withBorder mb="lg" bg="gray.0">
                <Group>
                    <Select
                        placeholder="상태 필터"
                        data={[
                            { value: 'PENDING', label: '대기중' },
                            { value: 'APPROVED', label: '승인됨' },
                            { value: 'PAID', label: '지급완료' },
                            { value: 'FAILED', label: '실패' },
                        ]}
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                        clearable
                        w={150}
                        leftSection={<IconCurrencyDollar size={16} />}
                    />
                    <Select
                        placeholder="지급월"
                        data={months}
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        w={150}
                        leftSection={<IconCalendar size={16} />}
                    />
                </Group>
            </Paper>

            {/* Payments Table */}
            <Paper radius="md" withBorder style={{ overflow: 'hidden' }}>
                <Table horizontalSpacing="lg" verticalSpacing="md" highlightOnHover>
                    <Table.Thead bg="gray.0">
                        <Table.Tr>
                            <Table.Th>지급월</Table.Th>
                            <Table.Th>강사명</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>최종 지급액</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>조정 금액</Table.Th>
                            <Table.Th>상태</Table.Th>
                            <Table.Th>지급일시</Table.Th>
                            <Table.Th style={{ width: '60px' }}></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {(Array.isArray(payments) && payments.length > 0) ? (
                            payments.map((payment) => (
                                <Table.Tr key={payment.id}>
                                    <Table.Td>
                                        <Text fw={500}>{payment.paymentMonth}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="sm">
                                            <IconUser size={16} style={{ opacity: 0.5 }} />
                                            <Text size="sm" fw={500}>{payment.instructorName || `강사 #${payment.instructorMembershipId}`}</Text>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>
                                        <Text fw={700}>
                                            <NumberFormatter value={payment.finalPaymentAmount} thousandSeparator suffix="원" />
                                        </Text>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>
                                        <Text c={payment.adjustmentAmount !== 0 ? 'orange' : 'dimmed'} size="sm">
                                            <NumberFormatter value={payment.adjustmentAmount} thousandSeparator suffix="원" />
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge
                                            color={
                                                payment.status === 'PAID' ? 'blue' :
                                                    payment.status === 'APPROVED' ? 'teal' :
                                                        payment.status === 'FAILED' ? 'red' : 'gray'
                                            }
                                            variant="light"
                                        >
                                            {payment.status}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dimmed">
                                            {payment.paidAt ? dayjs(payment.paidAt).format('YYYY-MM-DD HH:mm') : '-'}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Menu position="bottom-end" withArrow>
                                            <Menu.Target>
                                                <ActionIcon variant="subtle" color="gray">
                                                    <IconDotsVertical size={16} />
                                                </ActionIcon>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Item
                                                    leftSection={<IconCheck size={14} />}
                                                    onClick={() => approveMutation.mutate(payment.id)}
                                                    disabled={payment.status !== 'PENDING'}
                                                >
                                                    승인
                                                </Menu.Item>
                                                <Menu.Item leftSection={<IconReceipt size={14} />}>영수증 보기</Menu.Item>
                                                <Menu.Divider />
                                                <Menu.Item leftSection={<IconX size={14} />} color="red">취소</Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        ) : (
                            <Table.Tr>
                                <Table.Td colSpan={7}>
                                    <Center py="xl">
                                        <Text c="dimmed">지급 내역이 없습니다.</Text>
                                    </Center>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Paper>

            {/* Create Payment Modal */}
            <Modal opened={opened} onClose={close} title="급여 지급 건 생성" centered>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <Select
                            label="강사 선택"
                            placeholder="강사를 선택해주세요"
                            data={instructors?.map(i => ({ value: String(i.membershipId), label: i.name })) || []}
                            value={form.values.instructorId}
                            onChange={(val) => form.setFieldValue('instructorId', val || '')}
                            searchable
                            nothingFoundMessage="강사가 없습니다."
                            required
                        />
                        <DatePickerInput
                            label="지급 월"
                            placeholder="YYYY-MM"
                            value={form.values.month}
                            onChange={(date) => form.setFieldValue('month', date ? dayjs(date).toDate() : new Date())}
                            required
                        />
                        <NumberInput
                            label="조정 금액"
                            description="추가 지급(+) 또는 차감(-) 금액"
                            placeholder="0"
                            value={form.values.adjustmentAmount}
                            onChange={(val) => form.setFieldValue('adjustmentAmount', Number(val))}
                            thousandSeparator
                        />
                        <TextInput
                            label="메모"
                            placeholder="비고 사항 입력"
                            {...form.getInputProps('memo')}
                        />
                        <Group justify="flex-end" mt="md">
                            <Button variant="light" onClick={close}>취소</Button>
                            <Button type="submit" loading={createMutation.isPending}>생성</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Container>
    );
}

// Helper icon
const IconConcurrencyDollar = ({ size }: { size: number }) => <IconCurrencyDollar size={size} />;
