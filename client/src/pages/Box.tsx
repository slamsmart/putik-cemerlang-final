import { Card, CardContent } from "@/components/ui/card";
import { AsideSubsection } from "./sections/AsideSubsection";
import { FooterSubsection } from "./sections/FooterSubsection";
import { MainSubsection } from "./sections/MainSubsection";

export const Box = (): JSX.Element => {
  return (
    <main className="min-h-screen w-full bg-[#f7f9fb]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col">
        <Card className="h-auto min-h-screen w-full border-0 bg-transparent shadow-none rounded-none">
          <CardContent className="flex h-full w-full flex-col p-0">
            <MainSubsection />
            <AsideSubsection />
            <FooterSubsection />
          </CardContent>
        </Card>
      </div>
    </main>
  );
};
