import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { waHref } from "@/lib/format";

/** Floating "chat on WhatsApp" button, shown on every public page when a number is set. */
export function WhatsAppButton({ number }: { number: string }) {
  return (
    <a
      href={waHref(number)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with us on WhatsApp: ${number}`}
      title="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_-8px_rgb(20_15_13/0.45)] transition-transform hover:-translate-y-0.5 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25d366] print:hidden"
    >
      <WhatsappLogo size={30} weight="fill" aria-hidden />
    </a>
  );
}
