export function getOpenGraphTags(rawPath: string, host: string = "") {
  const path = rawPath.split('?')[0];
  // Use a protocol-relative or base URL if possible
  const baseUrl = host.includes("localhost") ? `http://${host}` : `https://${host}`;
  const defaultImage = `${baseUrl}/logo.png`;
  
  let title = "Putik Cemerlang";
  let description = "Portal Layanan Resmi Putik Cemerlang";
  let image = `${baseUrl}/logo.png`; // Default image

  const t = Date.now();
  if (path === "/" || path === "/index.html") {
    title = "Beranda | Putik Cemerlang";
    description = "Selamat datang di portal layanan resmi Putik Cemerlang.";
    image = `${baseUrl}/logo.png?v=${t}`;
  } else if (path.includes("/buku-tamu")) {
    title = "Buku Tamu | Putik Cemerlang";
    description = "Silakan isi form buku tamu untuk mencatat kunjungan Anda.";
    image = `https://placehold.co/1200x630/0ea5e9/ffffff?text=Buku+Tamu&v=${t}`;
  } else if (path.includes("/pengaduan-masyarakat")) {
    title = "Pengaduan Masyarakat | Putik Cemerlang";
    description = "Layanan pengaduan masyarakat. Sampaikan laporan Anda dengan aman.";
    image = `https://placehold.co/1200x630/eab308/ffffff?text=Pengaduan+Masyarakat&v=${t}`;
  } else if (path.includes("/whistle-blowing")) {
    title = "Whistle Blowing System | Putik Cemerlang";
    description = "Layanan pelaporan pelanggaran yang aman dan rahasia.";
    image = `https://placehold.co/1200x630/ef4444/ffffff?text=Whistle+Blowing&v=${t}`;
  } else if (path.includes("/pelaporan-gratifikasi")) {
    title = "Pelaporan Gratifikasi | Putik Cemerlang";
    description = "Layanan pelaporan penerimaan atau penolakan gratifikasi.";
    image = `https://placehold.co/1200x630/10b981/ffffff?text=Pelaporan+Gratifikasi&v=${t}`;
  } else if (path.includes("/kontak")) {
    title = "Kontak Kami | Putik Cemerlang";
    description = "Informasi kontak, lokasi, dan jam layanan kami.";
    image = `https://placehold.co/1200x630/8b5cf6/ffffff?text=Kontak+Kami&v=${t}`;
  } else if (path.includes("/profile")) {
    title = "Profil Instansi | Putik Cemerlang";
    description = "Visi, misi, dan struktur organisasi kami.";
    image = `https://placehold.co/1200x630/3b82f6/ffffff?text=Profil+Instansi&v=${t}`;
  } else if (path.includes("/voting-eom")) {
    title = "Voting Employee of the Month | Putik Cemerlang";
    description = "Berikan suara Anda untuk kandidat Employee of the Month.";
    image = `https://placehold.co/1200x630/f59e0b/ffffff?text=Voting+EOM&v=${t}`;
  } else if (path.includes("/admin/login")) {
    title = "Login | Putik Cemerlang";
    description = "Silakan login untuk mengakses halaman admin.";
    image = `${baseUrl}/logo.png?v=${t}`;
  } else if (path.includes("/admin")) {
    title = "Admin Dashboard | Putik Cemerlang";
    description = "Halaman khusus administrator.";
    image = `${baseUrl}/logo.png?v=${t}`;
  }

  return `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${baseUrl}${path}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
  `;
}
