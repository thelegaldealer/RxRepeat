import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2, FileText, ChevronRight, File, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// Recursive tree component for sidebar
const PageTree = ({ pages, parentId, level = 0, activePageId, setActivePageId }: any) => {
  const children = pages.filter((p: any) => p.parent === parentId);
  if (children.length === 0) return null;

  return (
    <ul className={`space-y-1 ${level > 0 ? 'ml-4 border-l pl-2' : ''}`}>
      {children.map((page: any) => (
        <li key={page.id}>
          <button
            onClick={() => setActivePageId(page.id)}
            className={`w-full text-left flex items-center p-2 rounded-md transition-colors text-sm ${activePageId === page.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'}`}
          >
            <File className="h-4 w-4 shrink-0 mr-2 opacity-70" />
            <span className="truncate">{page.title}</span>
          </button>
          {/* Recurse for children */}
          <PageTree 
            pages={pages}
            parentId={page.id}
            level={level + 1}
            activePageId={activePageId}
            setActivePageId={setActivePageId}
          />
        </li>
      ))}
    </ul>
  );
};

export default function ModuleContent() {
  const { moduleId } = useParams();
  const [pages, setPages] = useState<any[]>([]);
  const [activePageId, setActivePageId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/content-pages/?module=${moduleId}`)
       .then(res => {
          setPages(res.data);
          if (res.data.length > 0) {
            // Automatically select the first root page
            const rootPages = res.data.filter((p: any) => !p.parent);
            if (rootPages.length > 0) setActivePageId(rootPages[0].id);
            else setActivePageId(res.data[0].id);
          }
       })
       .catch(err => setError('Failed to load module content.'))
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
    return <div className="text-destructive p-4">{error}</div>;
  }

  const activePage = pages.find(p => p.id === activePageId);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-card border rounded-lg overflow-hidden">
      {/* Sidebar Navigation Tree */}
      <div className="w-64 shrink-0 border-r bg-muted/20 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold flex items-center">
            <FileText className="h-4 w-4 mr-2 text-primary" />
            Study Content
          </h3>
        </div>
        <ScrollArea className="flex-1 p-4">
          {pages.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No pages exist yet.</p>
          ) : (
            <PageTree 
              pages={pages}
              parentId={null}
              activePageId={activePageId}
              setActivePageId={setActivePageId}
            />
          )}
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {activePage ? (
          <ScrollArea className="flex-1">
            <div className="max-w-4xl mx-auto p-8 lg:p-12">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                <Button variant="ghost" size="icon" asChild className="h-6 w-6 mr-1">
                  <Link to={`/dashboard`}>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <span>Module Material</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium truncate">{activePage.title}</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
                {activePage.title}
              </h1>
              <div className="prose dark:prose-invert prose-blue max-w-none">
                {/* For real implementation, this would parse blocks. For MVP we render generic view */}
                {activePage.body_json ? (
                  <pre className="whitespace-pre-wrap font-sans bg-muted/50 p-6 rounded-lg text-sm">
                    {JSON.stringify(activePage.body_json, null, 2)}
                  </pre>
                ) : (
                  <p className="text-muted-foreground text-lg italic">
                    This page currently has no rich content body attached. Adming editing tools will populate this layout.
                  </p>
                )}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <FileText className="h-16 w-16 opacity-20 mb-4" />
            <p className="text-lg">Select a page from the sidebar to start reading.</p>
          </div>
        )}
      </div>
    </div>
  );
}
