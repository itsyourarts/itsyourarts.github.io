import './globals.css';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = {
  title: 'GodxShadow',
  description: 'A glassmorphism neon chatting app — message anyone by username',
};

export const viewport = {
  themeColor: '#04050d',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* theme flash rokne ke liye page load se pehle saved theme lagao */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('gx-theme')==='whatsapp')document.documentElement.dataset.theme='whatsapp'}catch(e){}",
          }}
        />
        <div className="bg-fx" aria-hidden="true">
          <i className="b1" />
          <i className="b2" />
          <i className="b3" />
          <div className="grid-fx" />
        </div>
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
