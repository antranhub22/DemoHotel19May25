// Model Staff đơn giản, có thể dùng với ORM hoặc raw SQL
export interface Staff {
  id: number;
  username: string;
  passwordHash: string;
  role: string; // 'admin' | 'staff'
  createdAt: Date;
}

// Prisma schema được định nghĩa trong prisma/schema.prisma
// Nếu dùng raw SQL, chỉ cần interface này để type-check
