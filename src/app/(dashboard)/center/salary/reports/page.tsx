'use client';

import { useState } from 'react';
import {
    Title,
    Text,
    Container,
    Paper,
    Table,
    Group,
    Button,
    Select,
    ActionIcon,
    Menu,
    Badge,
    Center,
    Loader,
    Modal,
    Stack,
    Divider,
    Box,
    NumberFormatter,
    ScrollArea
} from '@mantine/core';
import {
    IconDownload,
    IconMail,
    IconPrinter,
    IconEye,
    IconDotsVertical,
    IconFileInvoice,
    IconRefresh
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { salaryApi } from '@/lib/api';
import dayjs from 'dayjs';
import { notifications } from '@mantine/notifications';

export default function SalaryReportsPage() {
    const [selectedMonth, setSelectedMonth] = useState<string>(dayjs().format('YYYY-MM'));
    const [previewId, setPreviewId] = useState<string | null>(null);

    // Fetch reports
    const { data: reports, isLoading } = useQuery({
        queryKey: ['salary', 'reports', selectedMonth],
        queryFn: () => salaryApi.getReports({ month: selectedMonth }), // Assuming API supports this
    });

    const handleSendEmail = (id: string) => {
        notifications.show({ title: '전송 중', message: '이메일을 전송하고 있습니다...', color: 'blue', loading: true });
        // Simulate API call
        setTimeout(() => {
            notifications.show({ title: '전송 완료', message: '정산서 이메일이 발송되었습니다.', color: 'teal' });
        }, 1500);
    };

    if (isLoading) {
        return <Center h={400}><Loader size="lg" /></Center>;
    }

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl" align="flex-end">
                <div>
                    <Title order={2} fw={800} mb={4}>정산서 관리</Title>
                    <Text c="dimmed" size="sm">강사별 월간 급여 정산서를 조회하고 발행합니다.</Text>
                </div>
                <Group>
                    <Select
                        value={selectedMonth}
                        onChange={(v) => v && setSelectedMonth(v)}
                        data={['2026-02', '2026-01', '2025-12'].map(m => ({ value: m, label: m }))} // Mock months
                        w={150}
                    />
                    <Button leftSection={<IconRefresh size={16} />} variant="light">
                        일괄 생성
                    </Button>
                </Group>
            </Group>

            <Paper radius="md" withBorder style={{ overflow: 'hidden' }}>
                <Table horizontalSpacing="lg" verticalSpacing="md" highlightOnHover>
                    <Table.Thead bg="gray.0">
                        <Table.Tr>
                            <Table.Th>발행월</Table.Th>
                            <Table.Th>강사명</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>확정 급여액</Table.Th>
                            <Table.Th>발행일</Table.Th>
                            <Table.Th>전송 상태</Table.Th>
                            <Table.Th style={{ width: '60px' }}></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {(!reports || reports.length === 0) ? (
                            <Table.Tr>
                                <Table.Td colSpan={6}>
                                    <Center py="xl">
                                        <Text c="dimmed">정산서 내역이 없습니다.</Text>
                                    </Center>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            reports.map((report) => (
                                <Table.Tr key={report.id}>
                                    <Table.Td>
                                        <Text fw={500}>{report.month}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="sm">
                                            <IconFileInvoice size={16} style={{ opacity: 0.5 }} />
                                            <Text fw={500}>{report.instructorName}</Text>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>
                                        <Text fw={600}>
                                            <NumberFormatter value={report.confirmedAmount} thousandSeparator suffix="원" />
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dimmed">
                                            {dayjs(report.generatedAt).format('YYYY-MM-DD')}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge
                                            color={report.status === 'SENT' ? 'blue' : 'gray'}
                                            variant="light"
                                        >
                                            {report.status === 'SENT' ? '전송완료' : '미전송'}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Menu position="bottom-end" withArrow>
                                            <Menu.Target>
                                                <ActionIcon variant="subtle" color="gray">
                                                    <IconDotsVertical size={16} />
                                                </ActionIcon>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Item leftSection={<IconEye size={14} />} onClick={() => setPreviewId(String(report.id))}>미리보기</Menu.Item>
                                                <Menu.Item leftSection={<IconDownload size={14} />}>PDF 다운로드</Menu.Item>
                                                <Menu.Divider />
                                                <Menu.Item leftSection={<IconMail size={14} />} onClick={() => handleSendEmail(String(report.id))}>이메일 전송</Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>
            </Paper>

            {/* Preview Modal Stub */}
            <Modal opened={!!previewId} onClose={() => setPreviewId(null)} title="정산서 미리보기" size="lg" centered>
                <Paper p="xl" withBorder bg="gray.0" mih={400}>
                    <Center h="100%">
                        <Stack align="center" gap="sm">
                            <IconFileInvoice size={48} style={{ opacity: 0.2 }} />
                            <Text c="dimmed">PDF 미리보기 화면이 여기에 표시됩니다.</Text>
                            <Text size="xs" c="dimmed">(ID: {previewId})</Text>
                        </Stack>
                    </Center>
                </Paper>
                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={() => setPreviewId(null)}>닫기</Button>
                    <Button leftSection={<IconPrinter size={16} />}>인쇄</Button>
                </Group>
            </Modal>
        </Container>
    );
}
