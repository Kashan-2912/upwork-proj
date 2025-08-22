import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge, ComplianceBadge, RiskBadge } from './ui/Badge'
import { Button } from './ui/Button'
import { useRecentAuditEvents } from '@/stores/dashboard'
import { formatters, truncateText } from '@/utils'
import { AuditEvent } from '@/types'

const RecentActivity: React.FC = () => {
  const recentEvents = useRecentAuditEvents(10)

  const getEventIcon = (event: AuditEvent) => {
    if (event.blocked) {
      return <Shield className="w-4 h-4 text-danger-600" />
    } else if (event.risk_score > 0.7) {
      return <AlertTriangle className="w-4 h-4 text-warning-600" />
    } else {
      return <CheckCircle className="w-4 h-4 text-success-600" />
    }
  }

  const getEventMessage = (event: AuditEvent) => {
    const entityCount = event.entities_detected.length
    const patternCount = event.patterns_detected.length
    
    if (event.blocked) {
      return `Blocked response with ${entityCount} entities and ${patternCount} patterns`
    } else if (event.risk_score > 0.7) {
      return `High risk content detected but allowed (score: ${event.risk_score.toFixed(2)})`
    } else {
      return `Content assessed and allowed (score: ${event.risk_score.toFixed(2)})`
    }
  }

  if (recentEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-2">No recent activity</p>
            <p className="text-sm">Activity will appear here as the system processes requests</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {recentEvents.length} events
            </Badge>
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {recentEvents.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getEventIcon(event)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <ComplianceBadge type={event.compliance_type} />
                      <RiskBadge score={event.risk_score} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatters.relative(event.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                    {getEventMessage(event)}
                  </p>
                  
                  {event.decision_reason && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Reason: {truncateText(event.decision_reason, 80)}
                    </p>
                  )}
                  
                  {/* Detected Entities */}
                  {event.entities_detected.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {event.entities_detected.slice(0, 3).map((entity, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400"
                        >
                          {entity.entity_type}
                          <span className="ml-1 text-blue-600 dark:text-blue-300">
                            {(entity.score * 100).toFixed(0)}%
                          </span>
                        </span>
                      ))}
                      {event.entities_detected.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          +{event.entities_detected.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Detected Patterns */}
                  {event.patterns_detected.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {event.patterns_detected.slice(0, 2).map((pattern) => (
                        <span
                          key={pattern}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400"
                        >
                          {pattern.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {event.patterns_detected.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          +{event.patterns_detected.length - 2} patterns
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {recentEvents.length >= 10 && (
          <div className="mt-6 text-center">
            <Button variant="outline" size="sm">
              Load More Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivity