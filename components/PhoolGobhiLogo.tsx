import Image from 'next/image';

export default function PhoolGobhiLogo() {
  return (
    <div className="relative w-12 h-12">
      <Image
        src="/broc-mascot.png"
        alt="Phool Gobhi Logo"
        width={48}
        height={48}
        priority
        className="w-full h-full object-contain"
      />
    </div>
  );
}
