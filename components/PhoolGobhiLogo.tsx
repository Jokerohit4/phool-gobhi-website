import Image from 'next/image';

export default function PhoolGobhiLogo({ interactive = false }: { interactive?: boolean }) {
  return (
    <div className="relative w-12 h-12">
      <Image
        src="/broc-mascot.png"
        alt="Phool Gobhi mascot, mid-flex"
        width={48}
        height={48}
        priority
        className={`w-full h-full object-contain ${
          interactive
            ? 'transition-transform duration-300 ease-out group-hover:rotate-[18deg] group-hover:scale-110 group-active:scale-95'
            : ''
        }`}
      />
    </div>
  );
}
