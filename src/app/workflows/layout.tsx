import { Navbar } from '@/components/nav/navbar';

export default function WorkflowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#DEE6E5]">
      <Navbar />
      {children}
    </div>
  );
}