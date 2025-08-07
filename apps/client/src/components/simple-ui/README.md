# Simple UI System for Hotel Voice Assistant

## 🎯 Philosophy
Replace 51 shadcn/ui components with 8-10 simple, clean components focused on hotel voice assistant needs.

## 📦 Core Components

### Essential Components (8):
1. **Button** - Primary/Secondary/Danger variants
2. **Card** - Simple container with shadow
3. **Modal** - Overlay dialogs
4. **Input** - Text inputs with validation
5. **Badge** - Status indicators 
6. **LoadingSpinner** - Loading states
7. **Divider** - Section separators
8. **Toast** - Notifications

### Optional Components (2):
9. **Avatar** - User profile images
10. **Switch** - Toggle controls

## 🎨 Design Tokens

### Colors (Minimal Palette):
- **Primary**: #2563eb (blue-600)
- **Success**: #16a34a (green-600) 
- **Warning**: #ea580c (orange-600)
- **Danger**: #dc2626 (red-600)
- **Gray**: #64748b (slate-500)
- **White**: #ffffff
- **Black**: #1e293b (slate-800)

### Typography:
- **Font**: Inter (already loaded)
- **Sizes**: xs(12px), sm(14px), base(16px), lg(18px), xl(20px), 2xl(24px)

### Spacing:
- **Scale**: 4px base (1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32)

### Border Radius:
- **sm**: 6px
- **md**: 8px  
- **lg**: 12px
- **full**: 9999px

## 🚀 Implementation Strategy

1. Create simple components without external dependencies
2. Use Tailwind for styling consistency
3. Keep component APIs similar to existing ones for easy migration
4. Focus on mobile-first responsive design
5. Maintain accessibility (a11y) standards

## 📱 Mobile-First Approach

All components designed for:
- Touch-friendly (44px minimum touch targets)
- Large text for readability
- Simple navigation patterns
- Gesture support where needed

## 🔧 Migration Plan

1. Create new simple components
2. Replace shadcn components gradually
3. Test on each page/feature
4. Remove unused shadcn dependencies
5. Optimize bundle size

## 🎭 Voice Assistant Specific Features

- **Voice Feedback**: Visual indicators for voice states
- **Language Switching**: Simple language selector
- **Call Status**: Clear call state indicators
- **Transcription Display**: Clean transcript UI
- **Hotel Branding**: Customizable hotel colors
