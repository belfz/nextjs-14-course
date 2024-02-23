'use server';

import {
  insertInvoice,
  updateInvoice as updateDbInvoice,
  deleteInvoice as deleteDbInvoice,
} from '@/app/lib/data';
import { CreateInvoiceSchema } from '@/app/lib/definitions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = CreateInvoiceSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = FormSchema.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await insertInvoice({ customerId, amount: amountInCents, status, date });
  } catch (error) {
    return { message: (error as Error).message };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = FormSchema.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;

  try {
    await updateDbInvoice(id, { customerId, amount: amountInCents, status });
  } catch (error) {
    return { message: (error as Error).message };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await deleteDbInvoice(id);
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted invoice.' };
  } catch (error) {
    return { message: (error as Error).message };
  }
}
