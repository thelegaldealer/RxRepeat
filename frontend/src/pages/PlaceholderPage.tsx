import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlaceholderPage({ title, description }: { title: string, description?: string }) {
  return (
    <div className="h-full w-full flex items-center justify-center p-8">
      <Card className="max-w-md w-full text-center p-6 border-dashed border-2 bg-muted/20">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description || 'This feature is currently under active development. Check back soon!'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mt-4">
            UniMaster v1.0 Production Phase
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
