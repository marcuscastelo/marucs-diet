'use client';

export default function Show({ when, children }: { when: boolean, children: any }) {
    return when ? children : null;
}