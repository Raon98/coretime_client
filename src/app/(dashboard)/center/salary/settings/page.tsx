'use client';

import {
    Container,
    Title,
    Text,
    Paper,
    Table,
    Group,
    Button,
    Badge,
    ActionIcon,
    TextInput,
    Loader,
    Center,
    Stack
} from '@mantine/core';
import { IconSearch, IconSettings, IconCurrencyDollar } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { instructorApi } from '@/lib/api';
import { useState } from 'react';

export default function SalarySettingsListPage() {
    const router = useRouter();
    const [search, setSearch] = useState('');

    // Fetch instructors
    const { data: instructors, isLoading } = useQuery({
        queryKey: ['instructors', 'list'],
        queryFn: () => instructorApi.getInstructors({}),
    });

    const filteredInstructors = instructors?.filter(instructor =>
        instructor.name.toLowerCase().includes(search.toLowerCase()) ||
        instructor.phone?.includes(search)
    );

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                <div>
                    <Title order={2} fw={800}>급여 설정 관리</Title>
                    <Text c="dimmed">강사별 급여 지급 기준(시급, 건별, 비율)을 설정합니다.</Text>
                </div>

                <Paper p="md" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                        <TextInput
                            placeholder="강사명 또는 전화번호 검색"
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            w={300}
                        />
                    </Group>

                    {isLoading ? (
                        <Center h={200}><Loader /></Center>
                    ) : (
                        <Table highlightOnHover verticalSpacing="sm">
                            <Table.Thead bg="gray.0">
                                <Table.Tr>
                                    <Table.Th>강사명</Table.Th>
                                    <Table.Th>연락처</Table.Th>
                                    <Table.Th>상태</Table.Th>
                                    <Table.Th style={{ textAlign: 'center' }}>설정하기</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filteredInstructors?.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={4} align="center" py="xl">
                                            <Text c="dimmed">검색 결과가 없습니다.</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    filteredInstructors?.map((instructor) => (
                                        <Table.Tr key={instructor.membershipId}>
                                            <Table.Td>
                                                <Group gap="sm">
                                                    <Text fw={500}>{instructor.name}</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>{instructor.phone || '-'}</Table.Td>
                                            <Table.Td>
                                                <Badge color={instructor.status === 'ACTIVE' ? 'teal' : 'gray'} variant="light">
                                                    {instructor.status || 'ACTIVE'}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td style={{ textAlign: 'center' }}>
                                                <Button
                                                    size="xs"
                                                    variant="light"
                                                    leftSection={<IconCurrencyDollar size={14} />}
                                                    onClick={() => router.push(`/center/instructors/${instructor.membershipId}/salary`)}
                                                >
                                                    급여 설정
                                                </Button>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                )}
                            </Table.Tbody>
                        </Table>
                    )}
                </Paper>
            </Stack>
        </Container>
    );
}
