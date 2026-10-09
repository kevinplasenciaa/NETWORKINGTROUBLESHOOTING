import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'NetTask — Engineering workbench',description:'A simulated MSP ticket queue and network engineering lab. Practice evidence-led troubleshooting.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
