'use client';

import {
    Title, Text, Container, SimpleGrid, Card, Group,
    Button, Badge, ActionIcon, NumberInput, TextInput,
    Select, Stack, Switch, Box, Modal
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconCurrencyWon, IconEdit, IconCheck } from '@tabler/icons-react';
import { useFinance, TicketProduct } from '@/context/FinanceContext';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';

export default function TicketProductPage() {
    const { products, addProduct, updateProduct, toggleProductStatus } = useFinance();
    const [opened, { open, close }] = useDisclosure(false);
    const [editingProduct, setEditingProduct] = useState<TicketProduct | null>(null);

    const handleOpenCreate = () => {
        setEditingProduct(null);
        open();
    };

    const handleOpenEdit = (product: TicketProduct) => {
        setEditingProduct(product);
        open();
    };

    const handleFormSubmit = (values: any) => {
        if (editingProduct) {
            updateProduct(editingProduct.id, values);
            notifications.show({ title: '수정 완료', message: '상품 정보가 수정되었습니다.', color: 'green' });
        } else {
            addProduct(values);
            notifications.show({ title: '등록 완료', message: '새 상품이 등록되었습니다.', color: 'green' });
        }
        close();
    };

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="lg">
                <Box>
                    <Title order={2}>수강권 상품 관리 (Products)</Title>
                    <Text c="dimmed">회원에게 판매할 수강권 상품을 등록하고 관리합니다.</Text>
                </Box>
                <Button leftSection={<IconPlus size={18} />} onClick={handleOpenCreate}>
                    새 상품 등록
                </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onToggle={() => toggleProductStatus(product.id)}
                        onEdit={() => handleOpenEdit(product)}
                    />
                ))}
            </SimpleGrid>

            {/* Create/Edit Modal */}
            <Modal
                opened={opened}
                onClose={close}
                title={editingProduct ? "상품 수정" : "새 상품 등록"}
                size="lg"
            >
                <ProductForm
                    initialValues={editingProduct || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={close}
                />
            </Modal>
        </Container>
    );
}

function ProductCard({ product, onToggle, onEdit }: { product: TicketProduct, onToggle: () => void, onEdit: () => void }) {
    return (
        <Card withBorder shadow="sm" radius="md" padding="lg">
            <Group justify="space-between" mb="xs">
                <Badge variant="light" color={product.type === '1:1' ? 'grape' : 'blue'}>
                    {product.type}
                </Badge>
                <Switch
                    label={product.isActive ? '판매 중' : '판매 중지'}
                    checked={product.isActive}
                    onChange={onToggle}
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
                    {product.price.toLocaleString()}원
                </Text>
                <ActionIcon variant="subtle" color="gray" onClick={onEdit}>
                    <IconEdit size={18} />
                </ActionIcon>
            </Group>
        </Card>
    );
}

function ProductForm({ initialValues, onSubmit, onCancel }: any) {
    const form = useForm({
        initialValues: {
            name: '',
            type: '1:1',
            sessionCount: 10,
            durationDays: 30,
            price: 0,
            ...initialValues
        },
        validate: {
            name: (val) => val.length > 0 ? null : '상품명을 입력하세요',
            price: (val) => val > 0 ? null : '가격을 입력하세요',
        }
    });

    // Reset form when initialValues change (e.g. switching from edit to create)
    useEffect(() => {
        if (initialValues) {
            form.setValues(initialValues);
        } else {
            form.reset();
        }
    }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <SimpleGrid cols={2} spacing="md">
                <TextInput
                    label="상품명"
                    placeholder="예: 1:1 10회 패키지"
                    required
                    {...form.getInputProps('name')}
                />
                <Select
                    label="수업 유형"
                    data={['1:1', 'GROUP']}
                    required
                    {...form.getInputProps('type')}
                />
                <NumberInput
                    label="제공 횟수"
                    min={1}
                    {...form.getInputProps('sessionCount')}
                />
                <NumberInput
                    label="유효 기간 (일)"
                    min={1}
                    {...form.getInputProps('durationDays')}
                />
                <NumberInput
                    label="판매 가격"
                    required
                    leftSection={<IconCurrencyWon size={16} />}
                    thousandSeparator
                    {...form.getInputProps('price')}
                />
            </SimpleGrid>

            <Group justify="flex-end" mt="lg">
                <Button variant="default" onClick={onCancel}>취소</Button>
                <Button type="submit">{initialValues ? '수정' : '등록'}</Button>
            </Group>
        </form>
    );
}
