import { redirect } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';

export default function ForArtistsPage() {
  redirect(ROUTES.ARTIST_PRO);
}
