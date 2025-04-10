
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PrescriptionInfo } from "./PrescriptionResult";
import { Clock, Trash2, History, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface HistoryItem {
  id: string;
  timestamp: Date;
  image: string;
  prescriptionInfo: PrescriptionInfo;
}

interface PrescriptionHistoryProps {
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

const PrescriptionHistory: React.FC<PrescriptionHistoryProps> = ({
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="mt-6 w-full border-2 shadow-md bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
          <CardTitle className="text-gray-800 flex items-center">
            <History className="mr-2 h-5 w-5 text-medical-500" />
            Recent Scans
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearHistory}
            className="text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <ScrollArea className="h-[300px] rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="border rounded-lg overflow-hidden hover:border-medical-500 hover:shadow-md transition-all duration-200 bg-white/80">
                    <div 
                      className="aspect-video relative bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center cursor-pointer"
                      onClick={() => onSelectHistoryItem(item)}
                    >
                      <img 
                        src={item.image} 
                        alt="Prescription" 
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">
                        {item.prescriptionInfo.medications?.[0] || 
                         (item.prescriptionInfo.overallScore !== undefined ? 
                          `Score: ${item.prescriptionInfo.overallScore}%` : "Resume")}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(item.timestamp).toLocaleDateString()} at {" "}
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="mt-2 flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs py-1 h-8 text-blue-600 hover:bg-blue-50 border-blue-200"
                          onClick={() => onSelectHistoryItem(item)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Analysis
                        </Button>
                        
                        {item.image.includes(".pdf") || item.image.endsWith(".pdf") ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="ml-2 w-full text-xs py-1 h-8 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Resume
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl h-[80vh]">
                              <iframe
                                src={item.image}
                                className="w-full h-full"
                                title="PDF Preview"
                              />
                            </DialogContent>
                          </Dialog>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PrescriptionHistory;
