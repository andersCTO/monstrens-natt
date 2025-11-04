import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visualisering - Monstrens Natt",
  description: "Animerad visualisering av spelare i Monstrens Natt",
};

export default function VisualizationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
