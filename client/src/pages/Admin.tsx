import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: trainees, isLoading } = trpc.admin.listTrainees.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Painel Administrativo</CardTitle>
            <CardDescription>Faça login para acessar</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo, {user?.name || "Administrador"}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p>Carregando trainees...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total de Participantes</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {trainees?.length || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Completaram</p>
                    <p className="text-3xl font-bold text-green-600">
                      {trainees?.filter(t => t.completed).length || 0}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Em Andamento</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {trainees?.filter(t => !t.completed).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Trainees</CardTitle>
                <CardDescription>
                  Todos os participantes do jogo de descoberta de talentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainees && trainees.length > 0 ? (
                    trainees.map((trainee) => (
                      <div
                        key={trainee.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{trainee.name}</h3>
                            <p className="text-sm text-gray-600">{trainee.whatsapp}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Iniciado em: {new Date(trainee.createdAt!).toLocaleDateString('pt-BR')}
                            </p>
                            {trainee.completedAt && (
                              <p className="text-xs text-gray-500">
                                Concluído em: {new Date(trainee.completedAt).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={trainee.completed ? "default" : "secondary"}>
                              {trainee.completed ? "Completo" : `Fase ${trainee.currentPhase}`}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-6 gap-2">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">R</p>
                            <p className="font-semibold">{trainee.scores.R}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">I</p>
                            <p className="font-semibold">{trainee.scores.I}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">D</p>
                            <p className="font-semibold">{trainee.scores.D}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">A</p>
                            <p className="font-semibold">{trainee.scores.A}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">F</p>
                            <p className="font-semibold">{trainee.scores.F}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">T</p>
                            <p className="font-semibold">{trainee.scores.T}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      Nenhum trainee cadastrado ainda.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

