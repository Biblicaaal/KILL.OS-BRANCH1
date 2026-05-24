---

# AI Rules and Guidelines

## Tech Stack

- **Framework**: React
- **Language**: TypeScript
- **Router**: React Router
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: lucide-react

## Coding Guidelines

1. **Responsive Design**: All components should be designed responsively.
2. **Error Handling**: Do not use `try/catch` blocks for error handling unless specifically requested by the user. Always throw errors to allow them to be caught and handled at a higher level.
3. **Dependencies**: Only use libraries and packages recommended in this document.
4. **Code Formatting**: Use <dyad-write> tags for all code output. Do not use markdown code blocks (```) or any other method of formatting code outside of <dyad-write>. This ensures that all changes are built and rendered correctly.

## Libraries and Their Usage

- **shadcn/ui**: For UI components. Import prebuilt components and do not edit their source files unless needed for a specific reason.
- **Tailwind CSS**: For styling. Utilize Tailwind classes extensively for layout, spacing, colors, and other design aspects.
- **lucide-react**: For icon usage.

## Directory Structure

- **src/pages/**:存放页面组件。
- **src/components/**:存放可重用的UI组件。
- **src/data.tsx**:存放数据和辅助性函数。

---