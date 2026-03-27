import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2, FolderTree, BookOpen, ChevronRight, FileText, SendHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function CourseDetail() {
  const { courseId } = useParams();
  const [tabs, setTabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/tabs/?course=${courseId}`)
       .then(res => setTabs(res.data))
       .catch(err => setError('Failed to load course syllabus. You may not have access.'))
       .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-destructive font-medium">{error}</p>
        <Button asChild variant="outline"><Link to="/dashboard">Go Back</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Course Curriculum</h2>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Explore the curriculum structure and dive into your content.</p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link to={`/dashboard/courses/${courseId}/expert`}>
              <SendHorizontal className="mr-2 h-4 w-4" /> Ask an Expert
            </Link>
          </Button>
        </div>
      </div>

      {tabs.length === 0 ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderTree className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Syllabus Empty</h3>
            <p className="text-muted-foreground mt-1">
              Your professor hasn't uploaded any modules to this course yet.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Curriculum Structure</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {tabs.sort((a,b) => a.order - b.order).map((tab: any) => (
                <AccordionItem key={tab.id} value={`tab-${tab.id}`}>
                  <AccordionTrigger className="hover:text-primary transition-colors">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-lg">{tab.title}</span>
                      {tab.description && (
                        <span className="text-sm text-muted-foreground font-normal mt-1 text-left">
                          {tab.description}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                      <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 hover:border-primary">
                        <Link to={`/dashboard/nodes/${tab.id}/content`}>
                          <FileText className="h-6 w-6 text-blue-500" />
                          <span>Content Nodes</span>
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 hover:border-primary">
                        <Link to={`/dashboard/nodes/${tab.id}/flashcards`}>
                          <BookOpen className="h-6 w-6 text-green-500" />
                          <span>Flashcards</span>
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 hover:border-primary">
                        <Link to={`/dashboard/nodes/${tab.id}/papers`}>
                          <FileText className="h-6 w-6 text-orange-500" />
                          <span>Practice Papers</span>
                        </Link>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
