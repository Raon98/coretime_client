'use client';

import { useState } from 'react';
import {
    Container,
    Title,
    Tabs,
    TextInput,
    ActionIcon,
    Group,
    Badge,
    Table,
    Avatar,
    Button,
    Card,
    Text,
    SimpleGrid,
    Stack,
    Tooltip,
    Modal,
    Textarea,
    Checkbox,
    Menu,
    Loader,
    Center,
    rem
} from '@mantine/core';
import {
    IconSearch,
    IconTable,
    IconLayoutGrid,
    IconUserCheck,
    IconUserX,
    IconUserPause,
    IconUserOff,
    IconDotsVertical,
    IconEye,
    IconBuilding
} from '@tabler/icons-react';
import { useActiveInstructors, usePendingInstructors, authApi, InstructorDto } from '@/lib/api';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { formatDistance } from 'date-fns';
import { ko } from 'date-fns/locale';

type ViewMode = 'table' | 'card';
type ActionType = 'approve' | 'reject' | 'suspend' | 'withdraw';

interface ActionModalState {
    opened: boolean;
    type: ActionType | null;
    instructor: InstructorDto | null;
}

const statusConfig = {
    PENDING_APPROVAL: { color: 'orange', label: '승인 대기' },
    ACTIVE: { color: 'green', label: '활성' },
    INACTIVE: { color: 'gray', label: '일시정지' },
    WITHDRAWN: { color: 'red', label: '퇴사' }
};

export default function InstructorManagementPage() {
    const [activeTab, setActiveTab] = useState<string | null>('active');
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [actionModal, setActionModal] = useState<ActionModalState>({
        opened: false,
        type: null,
        instructor: null
    });
    const [rejectionReason, setRejectionReason] = useState('');
    const [confirmWithdraw, setConfirmWithdraw] = useState(false);

    const queryClient = useQueryClient();

    // Queries
    const { data: activeInstructors = [], isLoading: isLoadingActive } = useActiveInstructors();
    const { data: pendingInstructors = [], isLoading: isLoadingPending } = usePendingInstructors();

    // Mutations
    const approveMutation = useMutation({
        mutationFn: ({ membershipId, isApproved }: { membershipId: string; isApproved: boolean }) =>
            authApi.updateMembershipStatus(membershipId, isApproved),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['instructors'] });
            notifications.show({
                title: '성공',
                message: variables.isApproved ? '강사 승인이 완료되었습니다' : '강사 신청이 거절되었습니다',
                color: 'green'
            });
            closeModal();
        },
        onError: (error: any) => {
            notifications.show({
                title: '오류',
                message: error.response?.data?.error?.message || '처리 중 오류가 발생했습니다',
                color: 'red'
            });
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ membershipId, status }: { membershipId: string; status: string }) =>
            authApi.updateInstructorStatus(membershipId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instructors', 'active'] });
            notifications.show({
                title: '성공',
                message: '강사 상태가 변경되었습니다',
                color: 'green'
            });
            closeModal();
        },
        onError: (error: any) => {
            notifications.show({
                title: '오류',
                message: error.response?.data?.error?.message || '처리 중 오류가 발생했습니다',
                color: 'red'
            });
        }
    });

    const openActionModal = (type: ActionType, instructor: InstructorDto) => {
        setActionModal({ opened: true, type, instructor });
        setRejectionReason('');
        setConfirmWithdraw(false);
    };

    const closeModal = () => {
        setActionModal({ opened: false, type: null, instructor: null });
        setRejectionReason('');
        setConfirmWithdraw(false);
    };

    const handleAction = () => {
        if (!actionModal.instructor) return;

        switch (actionModal.type) {
            case 'approve':
                approveMutation.mutate({ membershipId: actionModal.instructor.membershipId, isApproved: true });
                break;
            case 'reject':
                approveMutation.mutate({ membershipId: actionModal.instructor.membershipId, isApproved: false });
                break;
            case 'suspend':
                statusMutation.mutate({ membershipId: actionModal.instructor.membershipId, status: 'INACTIVE' });
                break;
            case 'withdraw':
                statusMutation.mutate({ membershipId: actionModal.instructor.membershipId, status: 'WITHDRAWN' });
                break;
        }
    };

    // Filter instructors by search query
    const filterInstructors = (instructors: InstructorDto[]) => {
        if (!searchQuery) return instructors;
        const query = searchQuery.toLowerCase();
        return instructors.filter(
            (i) =>
                i.name.toLowerCase().includes(query) ||
                i.phone.toLowerCase().includes(query) ||
                i.email?.toLowerCase().includes(query)
        );
    };

    const filteredActive = filterInstructors(activeInstructors);
    const filteredPending = filterInstructors(pendingInstructors);

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between">
                    <div>
                        <Title order={2}>강사 관리</Title>
                        <Text size="sm" c="dimmed">강사 가입 승인 및 상태 관리</Text>
                    </div>
                    <Group>
                        <TextInput
                            placeholder="이름, 연락처 검색"
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            style={{ width: 250 }}
                        />
                        <Tooltip label={viewMode === 'table' ? '카드 뷰' : '테이블 뷰'}>
                            <ActionIcon
                                variant="light"
                                size="lg"
                                onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
                            >
                                {viewMode === 'table' ? <IconLayoutGrid size={18} /> : <IconTable size={18} />}
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Group>

                {/* Tabs */}
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List>
                        <Tabs.Tab value="active" leftSection={<IconUserCheck size={16} />}>
                            활성 강사
                            {filteredActive.length > 0 && (
                                <Badge size="sm" circle ml={8}>{filteredActive.length}</Badge>
                            )}
                        </Tabs.Tab>
                        <Tabs.Tab value="pending" leftSection={<IconUserX size={16} />}>
                            승인 대기
                            {filteredPending.length > 0 && (
                                <Badge size="sm" color="orange" circle ml={8}>{filteredPending.length}</Badge>
                            )}
                        </Tabs.Tab>
                    </Tabs.List>

                    {/* Active Instructors Tab */}
                    <Tabs.Panel value="active" pt="md">
                        {isLoadingActive ? (
                            <Center h={300}><Loader /></Center>
                        ) : filteredActive.length === 0 ? (
                            <Center h={300}>
                                <Stack align="center" gap="xs">
                                    <IconBuilding size={48} stroke={1.5} color="gray" />
                                    <Text c="dimmed">활성 강사가 없습니다</Text>
                                </Stack>
                            </Center>
                        ) : viewMode === 'table' ? (
                            <InstructorTable
                                instructors={filteredActive}
                                onAction={openActionModal}
                                isPending={false}
                            />
                        ) : (
                            <InstructorCards
                                instructors={filteredActive}
                                onAction={openActionModal}
                                isPending={false}
                            />
                        )}
                    </Tabs.Panel>

                    {/* Pending Instructors Tab */}
                    <Tabs.Panel value="pending" pt="md">
                        {isLoadingPending ? (
                            <Center h={300}><Loader /></Center>
                        ) : filteredPending.length === 0 ? (
                            <Center h={300}>
                                <Stack align="center" gap="xs">
                                    <IconUserCheck size={48} stroke={1.5} color="gray" />
                                    <Text c="dimmed">대기 중인 요청이 없습니다</Text>
                                </Stack>
                            </Center>
                        ) : viewMode === 'table' ? (
                            <InstructorTable
                                instructors={filteredPending}
                                onAction={openActionModal}
                                isPending={true}
                            />
                        ) : (
                            <InstructorCards
                                instructors={filteredPending}
                                onAction={openActionModal}
                                isPending={true}
                            />
                        )}
                    </Tabs.Panel>
                </Tabs>
            </Stack>

            {/* Action Modals */}
            <ActionModals
                state={actionModal}
                onClose={closeModal}
                onConfirm={handleAction}
                rejectionReason={rejectionReason}
                setRejectionReason={setRejectionReason}
                confirmWithdraw={confirmWithdraw}
                setConfirmWithdraw={setConfirmWithdraw}
                isLoading={approveMutation.isPending || statusMutation.isPending}
            />
        </Container>
    );
}

// Table View Component
function InstructorTable({
    instructors,
    onAction,
    isPending
}: {
    instructors: InstructorDto[];
    onAction: (type: ActionType, instructor: InstructorDto) => void;
    isPending: boolean;
}) {
    return (
        <Table.ScrollContainer minWidth={700}>
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>강사</Table.Th>
                        <Table.Th>연락처</Table.Th>
                        {!isPending && <Table.Th>상태</Table.Th>}
                        <Table.Th>{isPending ? '신청일' : '가입일'}</Table.Th>
                        <Table.Th>작업</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {instructors.map((instructor) => (
                        <Table.Tr key={instructor.membershipId}>
                            <Table.Td>
                                <Group gap="sm">
                                    <Avatar
                                        src={instructor.profileImageUrl || undefined}
                                        radius="xl"
                                        size="md"
                                    >
                                        {instructor.name.charAt(0)}
                                    </Avatar>
                                    <div>
                                        <Text fw={500}>{instructor.name}</Text>
                                        <Text size="xs" c="dimmed">{instructor.email}</Text>
                                    </div>
                                </Group>
                            </Table.Td>
                            <Table.Td>{instructor.phone}</Table.Td>
                            {!isPending && (
                                <Table.Td>
                                    <Badge color={statusConfig[instructor.status as keyof typeof statusConfig]?.color}>
                                        {statusConfig[instructor.status as keyof typeof statusConfig]?.label}
                                    </Badge>
                                </Table.Td>
                            )}
                            <Table.Td>
                                <Text size="sm">
                                    {instructor.joinedAt
                                        ? formatDistance(new Date(instructor.joinedAt), new Date(), {
                                            addSuffix: true,
                                            locale: ko
                                        })
                                        : '-'}
                                </Text>
                            </Table.Td>
                            <Table.Td>
                                <InstructorActions
                                    instructor={instructor}
                                    isPending={isPending}
                                    onAction={onAction}
                                />
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Table.ScrollContainer>
    );
}

// Card View Component
function InstructorCards({
    instructors,
    onAction,
    isPending
}: {
    instructors: InstructorDto[];
    onAction: (type: ActionType, instructor: InstructorDto) => void;
    isPending: boolean;
}) {
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {instructors.map((instructor) => (
                <Card key={instructor.membershipId} withBorder padding="lg" radius="md">
                    <Stack gap="md">
                        <Group>
                            <Avatar
                                src={instructor.profileImageUrl || undefined}
                                radius="xl"
                                size="lg"
                            >
                                {instructor.name.charAt(0)}
                            </Avatar>
                            <div style={{ flex: 1 }}>
                                <Text fw={600}>{instructor.name}</Text>
                                <Text size="sm" c="dimmed">{instructor.phone}</Text>
                            </div>
                            {!isPending && (
                                <Badge color={statusConfig[instructor.status as keyof typeof statusConfig]?.color}>
                                    {statusConfig[instructor.status as keyof typeof statusConfig]?.label}
                                </Badge>
                            )}
                        </Group>

                        <div>
                            <Text size="xs" c="dimmed" mb={4}>
                                {isPending ? '신청일' : '가입일'}
                            </Text>
                            <Text size="sm">
                                {instructor.joinedAt
                                    ? formatDistance(new Date(instructor.joinedAt), new Date(), {
                                        addSuffix: true,
                                        locale: ko
                                    })
                                    : '-'}
                            </Text>
                        </div>

                        <InstructorActions
                            instructor={instructor}
                            isPending={isPending}
                            onAction={onAction}
                            isCard
                        />
                    </Stack>
                </Card>
            ))}
        </SimpleGrid>
    );
}

// Actions Component (Dropdown or Buttons)
function InstructorActions({
    instructor,
    isPending,
    onAction,
    isCard = false
}: {
    instructor: InstructorDto;
    isPending: boolean;
    onAction: (type: ActionType, instructor: InstructorDto) => void;
    isCard?: boolean;
}) {
    if (isPending) {
        return (
            <Group gap="xs" wrap="nowrap">
                <Button
                    size="xs"
                    color="green"
                    leftSection={<IconUserCheck size={14} />}
                    onClick={() => onAction('approve', instructor)}
                    fullWidth={isCard}
                >
                    승인
                </Button>
                <Button
                    size="xs"
                    color="red"
                    variant="light"
                    leftSection={<IconUserX size={14} />}
                    onClick={() => onAction('reject', instructor)}
                    fullWidth={isCard}
                >
                    거절
                </Button>
            </Group>
        );
    }

    if (isCard) {
        return (
            <Group gap="xs">
                <Button
                    size="xs"
                    variant="light"
                    color="orange"
                    leftSection={<IconUserPause size={14} />}
                    onClick={() => onAction('suspend', instructor)}
                    fullWidth
                    disabled={instructor.status === 'INACTIVE'}
                >
                    일시정지
                </Button>
                <Button
                    size="xs"
                    variant="light"
                    color="red"
                    leftSection={<IconUserOff size={14} />}
                    onClick={() => onAction('withdraw', instructor)}
                    fullWidth
                    disabled={instructor.status === 'WITHDRAWN'}
                >
                    퇴사처리
                </Button>
            </Group>
        );
    }

    return (
        <Menu position="bottom-end" withArrow>
            <Menu.Target>
                <ActionIcon variant="subtle">
                    <IconDotsVertical size={16} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<IconUserPause size={14} />}
                    onClick={() => onAction('suspend', instructor)}
                    disabled={instructor.status === 'INACTIVE'}
                >
                    일시정지
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconUserOff size={14} />}
                    color="red"
                    onClick={() => onAction('withdraw', instructor)}
                    disabled={instructor.status === 'WITHDRAWN'}
                >
                    퇴사처리
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}

// Action Modals Component
function ActionModals({
    state,
    onClose,
    onConfirm,
    rejectionReason,
    setRejectionReason,
    confirmWithdraw,
    setConfirmWithdraw,
    isLoading
}: {
    state: ActionModalState;
    onClose: () => void;
    onConfirm: () => void;
    rejectionReason: string;
    setRejectionReason: (value: string) => void;
    confirmWithdraw: boolean;
    setConfirmWithdraw: (value: boolean) => void;
    isLoading: boolean;
}) {
    const { opened, type, instructor } = state;

    if (!instructor) return null;

    switch (type) {
        case 'approve':
            return (
                <Modal opened={opened} onClose={onClose} title="강사 가입 승인" centered>
                    <Stack>
                        <Text>다음 강사의 가입을 승인하시겠습니까?</Text>
                        <Card withBorder>
                            <Group>
                                <Avatar src={instructor.profileImageUrl || undefined} radius="xl">
                                    {instructor.name.charAt(0)}
                                </Avatar>
                                <div>
                                    <Text fw={600}>{instructor.name}</Text>
                                    <Text size="sm" c="dimmed">{instructor.phone}</Text>
                                </div>
                            </Group>
                        </Card>
                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={onClose} disabled={isLoading}>
                                취소
                            </Button>
                            <Button onClick={onConfirm} loading={isLoading}>
                                승인하기
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            );

        case 'reject':
            return (
                <Modal opened={opened} onClose={onClose} title="⚠️ 가입 요청 거절" centered>
                    <Stack>
                        <Text>거절 사유를 입력해주세요</Text>
                        <Textarea
                            placeholder="거절 사유 (선택사항)"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.currentTarget.value)}
                            minRows={3}
                        />
                        <Card withBorder bg="red.0">
                            <Group>
                                <Avatar src={instructor.profileImageUrl || undefined} radius="xl">
                                    {instructor.name.charAt(0)}
                                </Avatar>
                                <div>
                                    <Text fw={600}>{instructor.name}</Text>
                                    <Text size="sm" c="dimmed">{instructor.phone}</Text>
                                </div>
                            </Group>
                        </Card>
                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={onClose} disabled={isLoading}>
                                취소
                            </Button>
                            <Button color="red" onClick={onConfirm} loading={isLoading}>
                                거절하기
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            );

        case 'suspend':
            return (
                <Modal opened={opened} onClose={onClose} title="강사 일시정지" centered>
                    <Stack>
                        <Text>강사를 일시정지 상태로 변경하시겠습니까?</Text>
                        <Textarea
                            label="정지 사유 (선택사항)"
                            placeholder="정지 사유를 입력하세요"
                            minRows={3}
                        />
                        <Card withBorder>
                            <Group>
                                <Avatar src={instructor.profileImageUrl || undefined} radius="xl">
                                    {instructor.name.charAt(0)}
                                </Avatar>
                                <div>
                                    <Text fw={600}>{instructor.name}</Text>
                                    <Text size="sm" c="dimmed">{instructor.phone}</Text>
                                </div>
                            </Group>
                        </Card>
                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={onClose} disabled={isLoading}>
                                취소
                            </Button>
                            <Button color="orange" onClick={onConfirm} loading={isLoading}>
                                일시정지
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            );

        case 'withdraw':
            return (
                <Modal opened={opened} onClose={onClose} title="⚠️ 강사 퇴사 처리" centered>
                    <Stack>
                        <Text c="red" fw={600}>퇴사 처리 시 복구할 수 없습니다</Text>
                        <Text size="sm" c="dimmed">
                            퇴사 처리된 강사는 더 이상 시스템에 접근할 수 없으며, 이 작업은 되돌릴 수 없습니다.
                        </Text>
                        <Card withBorder bg="red.0">
                            <Group>
                                <Avatar src={instructor.profileImageUrl || undefined} radius="xl">
                                    {instructor.name.charAt(0)}
                                </Avatar>
                                <div>
                                    <Text fw={600}>{instructor.name}</Text>
                                    <Text size="sm" c="dimmed">{instructor.phone}</Text>
                                </div>
                            </Group>
                        </Card>
                        <Checkbox
                            label="위 내용을 확인했으며 퇴사 처리를 진행합니다"
                            checked={confirmWithdraw}
                            onChange={(e) => setConfirmWithdraw(e.currentTarget.checked)}
                        />
                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={onClose} disabled={isLoading}>
                                취소
                            </Button>
                            <Button
                                color="red"
                                onClick={onConfirm}
                                disabled={!confirmWithdraw}
                                loading={isLoading}
                            >
                                퇴사처리
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            );

        default:
            return null;
    }
}
