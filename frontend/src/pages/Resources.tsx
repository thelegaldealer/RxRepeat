import React from 'react';
import { Book, Link as LinkIcon, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Resources() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Global Resources</h2>
        <p className="text-muted-foreground">
          Curated textbooks, reference materials, and academic links across all your courses.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Book className="mr-2 h-5 w-5" /> Digital Textbooks</CardTitle>
            <CardDescription>Required reading and supplementary material.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">Rang & Dale's Pharmacology (9th Ed)</p>
                  <p className="text-sm text-muted-foreground">PDF • 145 MB</p>
                </div>
                <Button variant="secondary" size="sm"><Download className="h-4 w-4 mr-2"/> Download</Button>
             </div>
             <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">Clinical Pharmacy and Therapeutics</p>
                  <p className="text-sm text-muted-foreground">EPUB • 82 MB</p>
                </div>
                <Button variant="secondary" size="sm"><Download className="h-4 w-4 mr-2"/> Download</Button>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><LinkIcon className="mr-2 h-5 w-5" /> Academic Websites</CardTitle>
            <CardDescription>Verified external databases and journals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">British National Formulary (BNF)</p>
                  <p className="text-sm text-muted-foreground">NICE Guidance</p>
                </div>
                <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4 mr-2"/> Visit</Button>
             </div>
             <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">PubMed Central</p>
                  <p className="text-sm text-muted-foreground">Biomedical Literature</p>
                </div>
                <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4 mr-2"/> Visit</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
