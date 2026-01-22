'use client';

import { Group, Text, Box, Image } from '@mantine/core';

interface BrandLogoProps {
    variant?: 'light' | 'dark' | 'color'; // Context (Login=Color, Sidebar=Light/Dark)
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function BrandLogo({ variant = 'color', size = 'md' }: BrandLogoProps) {
    const isSmall = size === 'sm';
    const isLarge = size === 'lg' || size === 'xl';

    // Size configurations
    const boxSize = isSmall ? 28 : isLarge ? 56 : 40;
    const fontSize = isSmall ? 16 : isLarge ? 28 : 22;

    return (
        <Group gap={isSmall ? 8 : 12} align="center">
            {/* Custom Logo Image */}
            <Box
                w={boxSize}
                h={boxSize}
                style={{
                    borderRadius: isSmall ? 8 : 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}
            >
                <Image
                    src="/logo.png"
                    alt="CoreTime Logo"
                    w="100%"
                    h="100%"
                    fit="contain"
                />
            </Box>

            {/* Logo Text - Straight, Clean, Sans-Serif */}
            <Group gap={2} align="baseline" style={{ userSelect: 'none' }}>
                <Text
                    fw={800} // Heavy but not black
                    size={`${fontSize}px`}
                    c={variant === 'light' ? 'white' : 'dark.9'}
                    style={{
                        letterSpacing: '-0.2px', // Tighter
                        lineHeight: 1,
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                    }}
                >
                    CORE
                </Text>
                <Text
                    fw={400} // Regular
                    size={`${fontSize}px`}
                    c={variant === 'light' ? 'gray.2' : 'dark.9'}
                    style={{
                        letterSpacing: '-0.2px',
                        lineHeight: 1,
                        // No italic
                    }}
                >
                    Time
                </Text>
                <Box
                    w={isLarge ? 5 : 4}
                    h={isLarge ? 5 : 4}
                    bg={variant === 'light' ? 'white' : '#14b8a6'}
                    style={{ borderRadius: '50%', marginBottom: isLarge ? 4 : 3, marginLeft: 2 }}
                />
            </Group>
        </Group>
    );
}
