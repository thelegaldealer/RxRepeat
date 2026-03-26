import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2, ArrowLeft, ArrowRight, FileText, Download, Clock, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function PracticePapers() {
  const { moduleId } = useParams();
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/practice-papers/?module=${moduleId}`)
       .then(res => setPapers(res.data))
       .catch(err => setError('Failed to load practice papers.'))
       .finally(() => setLoading(false));
  }, [moduleId]);

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
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
        <Button variant="ghost" size="icon" asChild className="h-6 w-6 mr-1">
          <Link to={`/dashboard`}>
             <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <span>Module {moduleId}</span>
        <ArrowRight className="h-3 w-3" />
        <span className="text-foreground font-medium">Practice Exams</span>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Practice Papers</h2>
        <p className="text-muted-foreground mt-2">Prepare for your exams using realistic timed papers and grading rubrics.</p>
      </div>

      {papers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-semibold">No Papers Uploaded</h3>
          <p className="text-muted-foreground mt-1">
            No practice papers have been attached to this module.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper: any) => (
            <Card key={paper.id} className="group hover:border-primary/50 transition-colors flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                     <CardTitle className="text-lg leading-tight mb-2">{paper.title}</CardTitle>
                     <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {paper.timed_attempt_duration && (
                          <span className="flex items-center"><Clock className="h-3 w-3 mr-1"/> {paper.timed_attempt_duration} mins</span>
                        )}
                        {paper.tag && (
                          <span className="flex items-center"><Tags className="h-3 w-3 mr-1"/> {paper.tag}</span>
                        )}
                     </div>
                  </div>
                  <FileText className="h-8 w-8 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardHeader>
              <CardContent className="flex-grow text-sm text-muted-foreground">
                 <p>{paper.description || 'No description provided.'}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-border pt-4 mt-4 space-x-2">
                <Button asChild variant="default" className="flex-1 flex items-center justify-center">
                  <a href={paper.file_url} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4 mr-2" /> Paper
                  </a>
                </Button>
                {paper.answer_key_url && (
                  <Button asChild variant="secondary" className="flex-1 flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white">
                    <a href={paper.answer_key_url} target="_blank" rel="noreferrer">
                      Rubric
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
