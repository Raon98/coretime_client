'use client';

import {
    Title, Text, Container, SimpleGrid, Card, Group,
    Button, Badge, ActionIcon, NumberInput, TextInput,
    Stack, Switch, Box, Modal, LoadingOverlay,
    Divider, Grid, SegmentedControl, Paper
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus, IconEdit, IconTicket,
    IconUsers, IconCalendar, IconCoin, IconFileText, IconTrash
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketProductApi, TicketProduct, TicketProductType, CreateTicketProductCommand } from '@/lib/api';

export default function TicketProductPage() {
    const queryClient = useQueryClient();
    const [opened, { open, close }] = useDisclosure(false);
    const [editingProduct, setEditingProduct] = useState<TicketProduct | null>(null);

    // Fetch products from API
    const { data: products = [], isLoading } = useQuery({
        queryKey: ['ticketProducts'],
        queryFn: ticketProductApi.getAll,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: ticketProductApi.create,
        onSuccess: () => {
            notifications.show({
                title: '등록 완료',
                message: '새 상품이 등록되었습니다.',
                color: 'green'
            });
            queryClient.invalidateQueries({ queryKey: ['ticketProducts'] });
            close();
        },
        onError: () => {
            notifications.show({
                title: '등록 실패',
                message: '상품 등록 중 오류가 발생했습니다.',
                color: 'red'
            });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateTicketProductCommand }) =>
            ticketProductApi.update(id, data),
        onSuccess: () => {
            notifications.show({
                title: '수정 완료',
                message: '상품 정보가 수정되었습니다.',
                color: 'green'
            });
            queryClient.invalidateQueries({ queryKey: ['ticketProducts'] });
            close();
        },
        onError: () => {
            notifications.show({
                title: '수정 실패',
                message: '상품 수정 중 오류가 발생했습니다.',
                color: 'red'
            });
        },
    });

    // Toggle status mutation with optimistic updates
    const toggleMutation = useMutation({
        mutationFn: ticketProductApi.toggleStatus,
        // Optimistic update for instant UI feedback
        onMutate: async (productId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['ticketProducts'] });

            // Snapshot previous value
            const previousProducts = queryClient.getQueryData<TicketProduct[]>(['ticketProducts']);

            // Optimistically update
            queryClient.setQueryData<TicketProduct[]>(['ticketProducts'], (old = []) =>
                old.map(product =>
                    product.id === productId
                        ? { ...product, isActive: !product.isActive }
                        : product
                )
            );

            return { previousProducts };
        },
        // Rollback on error
        onError: (err, productId, context) => {
            if (context?.previousProducts) {
                queryClient.setQueryData(['ticketProducts'], context.previousProducts);
            }
            notifications.show({
                title: '상태 변경 실패',
                message: '상태를 변경하는 중 오류가 발생했습니다.',
                color: 'red',
            });
        },
        // Always refetch after error or success
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['ticketProducts'] });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: ticketProductApi.delete,
        onSuccess: () => {
            notifications.show({
                title: '삭제 완료',
                message: '상품이 삭제되었습니다.',
                color: 'green',
            });
            queryClient.invalidateQueries({ queryKey: ['ticketProducts'] });
        },
        onError: () => {
            notifications.show({
                title: '삭제 실패',
                message: '이미 판매된 상품이거나 삭제할 수 없는 상태입니다.',
                color: 'red',
            });
        },
    });



    const handleOpenCreate = () => {
        setEditingProduct(null);
        open();
    };

    const handleOpenEdit = (product: TicketProduct) => {
        setEditingProduct(product);
        open();
    };

    const handleDelete = (product: TicketProduct) => {
        modals.openConfirmModal({
            title: '상품 삭제',
            centered: true,
            children: (
                <Text size="sm">
                    정말로 <Text span fw={700}>{product.name}</Text> 상품을 삭제하시겠습니까?
                    <br />
                    이 작업은 되돌릴 수 없습니다.
                </Text>
            ),
            labels: { confirm: '삭제', cancel: '취소' },
            confirmProps: { color: 'red' },
            onConfirm: () => deleteMutation.mutate(product.id),
        });
    };



    const handleFormSubmit = (values: CreateTicketProductCommand) => {
        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct.id, data: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const hasProducts = products.length > 0;

    return (
        <Container size="xl" py="xl">
            <LoadingOverlay visible={isLoading} />

            <Group justify="space-between" mb="lg">
                <Box>
                    <Title order={2}>수강권 상품 관리</Title>
                    <Text c="dimmed">회원에게 판매할 수강권 상품을 등록하고 관리합니다.</Text>
                </Box>
                {/* 상품이 있을 때만 헤더 버튼 표시 */}
                {hasProducts && (
                    <Button leftSection={<IconPlus size={18} />} onClick={handleOpenCreate}>
                        새 상품 등록
                    </Button>
                )}
            </Group>

            {!hasProducts && !isLoading ? (
                // 빈 상태
                <Paper shadow="sm" radius="md" p="xl" ta="center" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Stack gap="lg" align="center">
                        <IconTicket size={80} color="var(--mantine-color-gray-4)" stroke={1.5} />
                        <div>
                            <Text size="xl" fw={600} mb="xs">등록된 상품이 없습니다</Text>
                            <Text c="dimmed" size="sm">
                                첫 번째 수강권 상품을 등록하고 회원들에게 판매를 시작하세요
                            </Text>
                        </div>
                        <Button
                            size="lg"
                            leftSection={<IconPlus size={20} />}
                            onClick={handleOpenCreate}
                        >
                            상품 등록하기
                        </Button>
                    </Stack>
                </Paper>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onToggle={() => toggleMutation.mutate(product.id)}
                            onEdit={() => handleOpenEdit(product)}
                            onDelete={() => handleDelete(product)}
                        />
                    ))}
                </SimpleGrid>
            )}

            {/* Create/Edit Modal */}
            <Modal
                opened={opened}
                onClose={close}
                title={
                    <Group gap="xs">
                        <IconTicket size={24} />
                        <Text fw={600} size="lg">
                            {editingProduct ? "상품 수정" : "새 상품 등록"}
                        </Text>
                    </Group>
                }
                size="lg"
                centered
            >
                <ProductForm
                    initialValues={editingProduct || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={close}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            </Modal>
        </Container>
    );
}

function ProductCard({ product, onToggle, onEdit, onDelete }: {
    product: TicketProduct;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const getTypeLabel = (type: TicketProductType) => {
        return type === 'ONE_TO_ONE' ? '1:1' : 'GROUP';
    };

    const getTypeColor = (type: TicketProductType) => {
        return type === 'ONE_TO_ONE' ? 'grape' : 'blue';
    };

    return (
        <Card withBorder shadow="sm" radius="md" padding="lg">
            <Group justify="space-between" mb="xs">
                <Badge variant="light" color={getTypeColor(product.type)}>
                    {getTypeLabel(product.type)}
                </Badge>
                <Switch
                    label={product.isActive ? '판매 중' : '판매 중지'}
                    checked={product.isActive}
                    onClick={onToggle}
                    size="xs"
                />
            </Group>

            <Text fw={700} size="lg" mt="xs">{product.name}</Text>

            <Group gap="xs" mt={4} mb="md">
                <Badge variant="outline" color="gray">{product.sessionCount}회</Badge>
                <Badge variant="outline" color="gray">{product.durationDays}일 유효</Badge>
            </Group>

            <Group justify="space-between" align="center" mt="auto">
                <Text size="xl" fw={700} c="indigo">
                    ₩ {new Intl.NumberFormat('ko-KR').format(product.price)}
                </Text>
                <Group gap={4}>
                    <ActionIcon variant="subtle" color="gray" onClick={onEdit}>
                        <IconEdit size={18} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={onDelete}>
                        <IconTrash size={18} />
                    </ActionIcon>
                </Group>
            </Group>
        </Card>
    );
}

function ProductForm({ initialValues, onSubmit, onCancel, isLoading }: {
    initialValues?: TicketProduct;
    onSubmit: (values: CreateTicketProductCommand) => void;
    onCancel: () => void;
    isLoading?: boolean;
}) {
    const form = useForm<CreateTicketProductCommand>({
        initialValues: {
            name: initialValues?.name || '',
            type: initialValues?.type || 'ONE_TO_ONE',
            sessionCount: initialValues?.sessionCount || 10,
            durationDays: initialValues?.durationDays || 30,
            price: initialValues?.price || 0,
        },
        validate: {
            name: (val) => val.length > 0 ? null : '상품명을 입력하세요',
            price: (val) => val > 0 ? null : '가격을 입력하세요',
            sessionCount: (val) => val > 0 ? null : '횟수를 입력하세요',
            durationDays: (val) => val > 0 ? null : '유효기간을 입력하세요',
        }
    });

    // Reset form when initialValues change
    useEffect(() => {
        if (initialValues) {
            form.setValues({
                name: initialValues.name,
                type: initialValues.type,
                sessionCount: initialValues.sessionCount,
                durationDays: initialValues.durationDays,
                price: initialValues.price,
            });
        } else {
            form.reset();
        }
    }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="lg">
                {/* 기본 정보 섹션 */}
                <div>
                    <Text size="sm" fw={600} c="dimmed" mb="xs">기본 정보</Text>
                    <Stack gap="md">
                        <TextInput
                            label="상품명"
                            placeholder="예: 프리미엄 1:1 필라테스 10회 패키지"
                            required
                            leftSection={<IconFileText size={16} />}
                            description="회원에게 표시될 상품명을 입력하세요"
                            {...form.getInputProps('name')}
                        />

                        <Box>
                            <Text size="sm" fw={500} mb={8}>수업 유형 *</Text>
                            <SegmentedControl
                                fullWidth
                                data={[
                                    {
                                        value: 'ONE_TO_ONE',
                                        label: (
                                            <Group gap="xs" justify="center">
                                                <IconUsers size={16} />
                                                <span>1:1</span>
                                            </Group>
                                        )
                                    },
                                    {
                                        value: 'GROUP',
                                        label: (
                                            <Group gap="xs" justify="center">
                                                <IconUsers size={16} />
                                                <span>그룹</span>
                                            </Group>
                                        )
                                    },
                                ]}
                                {...form.getInputProps('type')}
                            />
                            <Text size="xs" c="dimmed" mt={4}>
                                1:1 수업 또는 그룹 수업을 선택하세요
                            </Text>
                        </Box>
                    </Stack>
                </div>

                <Divider />

                {/* 상세 정보 섹션 */}
                <div>
                    <Text size="sm" fw={600} c="dimmed" mb="xs">상세 정보</Text>
                    <Grid gutter="md">
                        <Grid.Col span={6}>
                            <NumberInput
                                label="제공 횟수"
                                placeholder="10"
                                min={1}
                                required
                                leftSection={<IconTicket size={16} />}
                                suffix=" 회"
                                description="수강 가능 횟수"
                                {...form.getInputProps('sessionCount')}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <NumberInput
                                label="유효 기간"
                                placeholder="30"
                                min={1}
                                required
                                leftSection={<IconCalendar size={16} />}
                                suffix=" 일"
                                description="사용 가능 기간"
                                {...form.getInputProps('durationDays')}
                            />
                        </Grid.Col>
                    </Grid>

                    <NumberInput
                        label="판매 가격"
                        placeholder="700000"
                        required
                        mt="md"
                        leftSection={<IconCoin size={16} />}
                        prefix="₩ "
                        thousandSeparator=","
                        min={0}
                        description="회원에게 판매할 가격을 입력하세요"
                        {...form.getInputProps('price')}
                    />
                </div>

                <Divider />

                {/* 버튼 그룹 */}
                <Group justify="flex-end">
                    <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
                        취소
                    </Button>
                    <Button
                        type="submit"
                        loading={isLoading}
                        leftSection={<IconPlus size={16} />}
                    >
                        {initialValues ? '수정 완료' : '등록하기'}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
