/**
 * UI Demo Page - Showcase Simple UI System
 * Compare new simple components vs old shadcn components
 */

import {
    Button,
    Card,
    CardContent,
    CardHeader,
    LoadingSpinner,
    Modal,
    VoiceLoadingSpinner
} from '@/components/simple-ui';
import React, { useState } from 'react';

// Import old shadcn components for comparison
// TODO: Migrate these manually: Button as OldButton
import { Button as OldButton } from '@/components/ui/button';
// TODO: Migrate these manually: Card as OldCard, CardContent as OldCardContent, CardHeader as OldCardHeader
import { Card as OldCard, CardContent as OldCardContent, CardHeader as OldCardHeader } from '@/components/ui/card';

const UIDemo: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleVoiceDemo = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        UI System Demo - Hotel Voice Assistant
                    </h1>
                    <p className="text-gray-600 text-lg">
                        So sánh Simple UI mới vs shadcn/ui cũ
                    </p>
                </div>

                {/* Buttons Comparison */}
                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold text-gray-900">✨ Simple UI (Mới)</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="primary">Primary</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="danger">Danger</Button>
                                    <Button variant="voice">Voice Assistant</Button>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Button size="sm">Small</Button>
                                    <Button size="md">Medium</Button>
                                    <Button size="lg">Large</Button>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Button loading>Loading...</Button>
                                    <Button
                                        icon={<span>🎤</span>}
                                        variant="voice"
                                        rounded
                                        onClick={handleVoiceDemo}
                                    >
                                        Bắt đầu gọi
                                    </Button>
                                </div>

                                <Button fullWidth variant="primary">
                                    Full Width Button
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <OldCard>
                        <OldCardHeader>
                            <h2 className="text-xl font-semibold text-gray-900">📦 shadcn/ui (Cũ)</h2>
                        </OldCardHeader>
                        <OldCardContent>
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-3">
                                    <OldButton>Default</OldButton>
                                    <OldButton variant="secondary">Secondary</OldButton>
                                    <OldButton variant="destructive">Destructive</OldButton>
                                    <OldButton variant="outline">Outline</OldButton>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <OldButton size="sm">Small</OldButton>
                                    <OldButton size="default">Default</OldButton>
                                    <OldButton size="lg">Large</OldButton>
                                </div>

                                <p className="text-sm text-gray-600">
                                    shadcn/ui có nhiều variants phức tạp nhưng không tối ưu cho voice assistant
                                </p>
                            </div>
                        </OldCardContent>
                    </OldCard>
                </div>

                {/* Voice Assistant Specific UI */}
                <Card variant="voice">
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-blue-900">🎤 Voice Assistant UI</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* Voice Loading States */}
                            <div className="text-center">
                                <h3 className="font-medium mb-4">Loading States</h3>
                                <div className="space-y-4">
                                    <LoadingSpinner size="sm" text="Connecting..." />
                                    <LoadingSpinner size="md" variant="primary" />
                                    <LoadingSpinner size="lg" variant="secondary" />
                                </div>
                            </div>

                            {/* Voice Specific Loading */}
                            <div className="text-center">
                                <h3 className="font-medium mb-4">Voice Loading</h3>
                                {loading ? (
                                    <VoiceLoadingSpinner
                                        size="lg"
                                        text="Đang kết nối với trợ lý ảo..."
                                    />
                                ) : (
                                    <Button
                                        variant="voice"
                                        onClick={handleVoiceDemo}
                                        icon={<span>🎤</span>}
                                        size="lg"
                                        rounded
                                    >
                                        Demo Voice
                                    </Button>
                                )}
                            </div>

                            {/* Voice States */}
                            <div className="text-center">
                                <h3 className="font-medium mb-4">Voice States</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm">Listening</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm">Speaking</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-spin"></div>
                                        <span className="text-sm">Processing</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Modal Demo */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-900">📱 Modal System</h2>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => setShowModal(true)}>
                            Mở Modal Demo
                        </Button>
                    </CardContent>
                </Card>

                {/* Design Tokens */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-gray-900">🎨 Design Tokens</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

                            {/* Colors */}
                            <div>
                                <h3 className="font-medium mb-3">Colors</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-blue-600 rounded"></div>
                                        <span className="text-sm">Primary</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-green-600 rounded"></div>
                                        <span className="text-sm">Success</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-red-600 rounded"></div>
                                        <span className="text-sm">Danger</span>
                                    </div>
                                </div>
                            </div>

                            {/* Typography */}
                            <div>
                                <h3 className="font-medium mb-3">Typography</h3>
                                <div className="space-y-1">
                                    <p className="text-xs">Extra Small (12px)</p>
                                    <p className="text-sm">Small (14px)</p>
                                    <p className="text-base">Base (16px)</p>
                                    <p className="text-lg">Large (18px)</p>
                                </div>
                            </div>

                            {/* Spacing */}
                            <div>
                                <h3 className="font-medium mb-3">Spacing</h3>
                                <div className="space-y-2">
                                    <div className="bg-blue-100 h-2 rounded" style={{ width: '1rem' }}></div>
                                    <div className="bg-blue-200 h-2 rounded" style={{ width: '1.5rem' }}></div>
                                    <div className="bg-blue-300 h-2 rounded" style={{ width: '2rem' }}></div>
                                    <div className="bg-blue-400 h-2 rounded" style={{ width: '3rem' }}></div>
                                </div>
                            </div>

                            {/* Touch Targets */}
                            <div>
                                <h3 className="font-medium mb-3">Touch Targets</h3>
                                <div className="space-y-2">
                                    <div className="bg-gray-200 rounded flex items-center justify-center text-xs" style={{ height: '44px' }}>
                                        44px (Min)
                                    </div>
                                    <div className="bg-gray-300 rounded flex items-center justify-center text-xs" style={{ height: '48px' }}>
                                        48px (Comfortable)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Comparison */}
                <div className="grid md:grid-cols-2 gap-8">
                    <Card variant="elevated">
                        <CardHeader>
                            <h2 className="text-xl font-semibold text-green-700">✅ Simple UI Benefits</h2>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">●</span>
                                    <span><strong>Smaller Bundle:</strong> ~90% ít dependencies hơn</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">●</span>
                                    <span><strong>Mobile-First:</strong> Tối ưu cho touch và voice</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">●</span>
                                    <span><strong>Simple API:</strong> Dễ customize và maintain</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">●</span>
                                    <span><strong>Hotel-Focused:</strong> Thiết kế cho hospitality</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">●</span>
                                    <span><strong>Voice-Optimized:</strong> Components cho voice interface</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card variant="outlined">
                        <CardHeader>
                            <h2 className="text-xl font-semibold text-orange-700">📦 shadcn/ui Limitations</h2>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">●</span>
                                    <span><strong>Heavy Bundle:</strong> 51 components, nhiều dependencies</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">●</span>
                                    <span><strong>Generic Design:</strong> Không tối ưu cho voice assistant</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">●</span>
                                    <span><strong>Complex API:</strong> Nhiều variants không cần thiết</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">●</span>
                                    <span><strong>Desktop-First:</strong> Cần nhiều customization cho mobile</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">●</span>
                                    <span><strong>TypeScript Conflicts:</strong> Nhiều type issues</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

            </div>

            {/* Demo Modal */}
            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                title="Demo Modal - Simple UI"
                size="md"
            >
                <div className="space-y-4">
                    <p>Đây là modal được tạo với Simple UI system mới.</p>
                    <div className="space-y-2">
                        <p className="font-medium">Features:</p>
                        <ul className="text-sm space-y-1 ml-4">
                            <li>• Portal rendering</li>
                            <li>• Escape key support</li>
                            <li>• Backdrop click to close</li>
                            <li>• Mobile-responsive</li>
                            <li>• Accessibility support</li>
                        </ul>
                    </div>

                    <Card variant="voice" padding="sm">
                        <p className="text-sm">
                            🎤 Modal này có thể được sử dụng cho voice assistant settings,
                            call summaries, hoặc language selection.
                        </p>
                    </Card>
                </div>
            </Modal>
        </div>
    );
};

export default UIDemo;
