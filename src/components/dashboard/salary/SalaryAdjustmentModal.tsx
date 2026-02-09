'use client';

import { Modal, Stack, Text, Select, NumberInput, Textarea, Button, Group, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { SalaryAdjustment } from '@/lib/api';

interface SalaryAdjustmentModalProps {
    opened: boolean;
    onClose: () => void;
    classId: string;
    className: string;
    instructorName: string;
    currentAmount: number;
    currentStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    onSubmit: (adjustment: SalaryAdjustment) => Promise<void>;
}

export function SalaryAdjustmentModal({
    opened,
    onClose,
    classId,
    className,
    instructorName,
    currentAmount,
    currentStatus,
    onSubmit
}: SalaryAdjustmentModalProps) {
    const form = useForm<{
        status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
        adjustedAmount: number;
        reason: string;
    }>({
        initialValues: {
            status: currentStatus,
            adjustedAmount: currentAmount,
            reason: ''
        },
        validate: {
            adjustedAmount: (value) => (value <= 0 ? '금액은 0보다 커야 합니다' : null),
            reason: (value) => (!value.trim() ? '변경 사유는 필수입니다' : null)
        }
    });

    const handleSubmit = async (values: typeof form.values) => {
        try {
            await onSubmit({
                classId: Number(classId), // Ensure number
                status: values.status,
                amount: values.adjustedAmount,
                reason: values.reason
            });
            form.reset();
            onClose();
        } catch (error) {
            console.error('Failed to adjust salary:', error);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="급여 수동 조정"
            size="md"
            centered
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <div>
                        <Text size="sm" fw={600}>수업</Text>
                        <Text size="sm" c="dimmed">{className}</Text>
                    </div>

                    <div>
                        <Text size="sm" fw={600}>강사</Text>
                        <Text size="sm" c="dimmed">{instructorName}</Text>
                    </div>

                    <div style={{ borderTop: '1px solid var(--mantine-color-gray-3)', paddingTop: 16 }} />

                    <div>
                        <Text size="sm" fw={600} mb={4}>현재 급여</Text>
                        <Text size="lg" fw={700}>{currentAmount.toLocaleString()}원</Text>
                        <Text size="xs" c="dimmed">상태: {currentStatus === 'CONFIRMED' ? '확정' : currentStatus === 'PENDING' ? '미확정' : '취소'}</Text>
                    </div>

                    <div style={{ borderTop: '1px solid var(--mantine-color-gray-3)', paddingTop: 16 }} />

                    <Select
                        label="새 상태"
                        placeholder="상태 선택"
                        data={[
                            { value: 'PENDING', label: '미확정' },
                            { value: 'CONFIRMED', label: '확정' },
                            { value: 'CANCELLED', label: '취소' }
                        ]}
                        {...form.getInputProps('status')}
                    />

                    <NumberInput
                        label="조정 금액"
                        placeholder="금액 입력"
                        thousandSeparator=","
                        suffix=" 원"
                        min={0}
                        {...form.getInputProps('adjustedAmount')}
                    />

                    <Textarea
                        label="변경 사유"
                        placeholder="변경 사유를 입력하세요 (필수)"
                        required
                        minRows={3}
                        {...form.getInputProps('reason')}
                    />

                    <Alert icon={<IconAlertCircle size={16} />} color="gray" variant="light">
                        <Text size="xs">이 변경은 변경 이력에 기록됩니다.</Text>
                    </Alert>

                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={onClose}>
                            취소
                        </Button>
                        <Button type="submit">
                            조정하기
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
