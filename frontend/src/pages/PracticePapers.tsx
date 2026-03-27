import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2, ArrowLeft, ArrowRight, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function PracticePapers() {
  const { nodeId } = useParams();
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/practice-papers/?node__tab=${nodeId}`)
       .then(res => setPapers(res.data))
       .catch(err => setError('Failed to load practice papers.'))
       .finally(() => setLoading(false));
  }, [nodeId]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive p-4 text-center">{error}</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <Button variant="ghost" size="icon" asChild className="h-6 w-6 mr-1">
              <Link to={`/dashboard`}>
                 <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <span>Node {nodeId}</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Practice Papers</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Practice Papers</h2>
          <p className="text-muted-foreground">Test your knowledge under exam conditions.</p>
        </div>
      </div>

      {papers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-semibold">No Papers Available</h3>
          <p className="text-muted-foreground mt-1">
            Check back closer to exam season.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {papers.map((paper: any) => (
            <Card key={paper.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 mb-2 text-primary opacity-80" />
                  {paper.tag && (
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                      {paper.tag}
                    </span>
                  )}
                </div>
                <CardTitle className="line-clamp-2">{paper.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                  {paper.description || 'A practice paper for this module.'}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{paper.timed_attempt_duration ? `${paper.timed_attempt_duration} mins` : 'Untimed'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date Added</span>
                    <span className="font-medium">{paper.date || 'Recent'}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 pt-4 border-t">
                <Button className="w-full text-left justify-start" variant="default" asChild>
                  <a href={paper.file_url} target="_blank" rel="noreferrer">
                    <Download className="mr-2 h-4 w-4" /> Download Exam
                  </a>
                </Button>
                {paper.answer_key_url && (
                  <Button className="w-full text-left justify-start" variant="outline" asChild>
                    <a href={paper.answer_key_url} target="_blank" rel="noreferrer">
                      View Mark Scheme
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
