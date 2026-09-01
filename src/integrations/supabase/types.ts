export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_grants: {
        Row: {
          area: string
          contact_id: string
          created_at: string
          created_by: string | null
          granted_at: string | null
          id: string
          last_error: string | null
          note: string | null
          revoked_at: string | null
          status: Database["public"]["Enums"]["access_state"]
          updated_at: string
        }
        Insert: {
          area: string
          contact_id: string
          created_at?: string
          created_by?: string | null
          granted_at?: string | null
          id?: string
          last_error?: string | null
          note?: string | null
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["access_state"]
          updated_at?: string
        }
        Update: {
          area?: string
          contact_id?: string
          created_at?: string
          created_by?: string | null
          granted_at?: string | null
          id?: string
          last_error?: string | null
          note?: string | null
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["access_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_grants_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          contact_id: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          id: string
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          id?: string
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          contact_id: string | null
          correlation_id: string | null
          created_at: string
          delta: Json
          entity_id: string | null
          entity_type: string
          id: string
          reason: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string
          contact_id?: string | null
          correlation_id?: string | null
          created_at?: string
          delta?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
          reason?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          contact_id?: string | null
          correlation_id?: string | null
          created_at?: string
          delta?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          created_by: string
          id: string
          industry: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          industry?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          industry?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_packages: {
        Row: {
          billing_interval: string
          company_id: string
          created_at: string
          created_by: string
          currency: string
          end_date: string | null
          id: string
          monthly_amount: number
          notes: string | null
          seats: number
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          tax_included: boolean
          tax_rate: number
          tier: Database["public"]["Enums"]["price_tier"]
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          company_id: string
          created_at?: string
          created_by: string
          currency?: string
          end_date?: string | null
          id?: string
          monthly_amount?: number
          notes?: string | null
          seats?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          tax_included?: boolean
          tax_rate?: number
          tier: Database["public"]["Enums"]["price_tier"]
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          company_id?: string
          created_at?: string
          created_by?: string
          currency?: string
          end_date?: string | null
          id?: string
          monthly_amount?: number
          notes?: string | null
          seats?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          tax_included?: boolean
          tax_rate?: number
          tier?: Database["public"]["Enums"]["price_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_packages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          contact_id: string
          created_at: string
          created_by: string | null
          granted: boolean
          granted_at: string | null
          id: string
          kind: string
          source: string | null
          updated_at: string
          version: string | null
          withdrawn_at: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          created_by?: string | null
          granted?: boolean
          granted_at?: string | null
          id?: string
          kind: string
          source?: string | null
          updated_at?: string
          version?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          created_by?: string | null
          granted?: boolean
          granted_at?: string | null
          id?: string
          kind?: string
          source?: string | null
          updated_at?: string
          version?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consents_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          campaign: string | null
          company_id: string | null
          consent_at: string | null
          consent_marketing: boolean
          consent_recording: boolean
          created_at: string
          created_by: string
          current_price_tier: Database["public"]["Enums"]["price_tier"]
          email: string | null
          first_name: string
          id: string
          is_foundation_member: boolean
          language: string
          last_name: string
          member_number: number | null
          phone: string | null
          position: string | null
          source: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          campaign?: string | null
          company_id?: string | null
          consent_at?: string | null
          consent_marketing?: boolean
          consent_recording?: boolean
          created_at?: string
          created_by: string
          current_price_tier?: Database["public"]["Enums"]["price_tier"]
          email?: string | null
          first_name: string
          id?: string
          is_foundation_member?: boolean
          language?: string
          last_name: string
          member_number?: number | null
          phone?: string | null
          position?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          campaign?: string | null
          company_id?: string | null
          consent_at?: string | null
          consent_marketing?: boolean
          consent_recording?: boolean
          created_at?: string
          created_by?: string
          current_price_tier?: Database["public"]["Enums"]["price_tier"]
          email?: string | null
          first_name?: string
          id?: string
          is_foundation_member?: boolean
          language?: string
          last_name?: string
          member_number?: number | null
          phone?: string | null
          position?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          close_date: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string
          id: string
          notes: string | null
          owner_id: string
          pipeline_id: string
          probability: number | null
          stage_id: string
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          close_date?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          owner_id: string
          pipeline_id: string
          probability?: number | null
          stage_id: string
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          close_date?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          owner_id?: string
          pipeline_id?: string
          probability?: number | null
          stage_id?: string
          title?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          name: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      enrollment_steps: {
        Row: {
          created_at: string
          done: boolean
          done_at: string | null
          due_date: string | null
          enrollment_id: string
          id: string
          name: string
          position: number
        }
        Insert: {
          created_at?: string
          done?: boolean
          done_at?: string | null
          due_date?: string | null
          enrollment_id: string
          id?: string
          name: string
          position?: number
        }
        Update: {
          created_at?: string
          done?: boolean
          done_at?: string | null
          due_date?: string | null
          enrollment_id?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_steps_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          access_status: Database["public"]["Enums"]["access_status"]
          cancel_date: string | null
          company_id: string | null
          completed_at: string | null
          contact_id: string
          created_at: string
          created_by: string
          external_ref: string | null
          funnel_source: string | null
          golem_campaign: string | null
          id: string
          is_test_record: boolean
          monthly_amount: number
          next_step: string | null
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          price_tier: Database["public"]["Enums"]["price_tier"]
          program_run_id: string | null
          program_type: Database["public"]["Enums"]["program_type"]
          recorded_bootcamp_required: boolean
          seats: number
          start_date: string | null
          status: Database["public"]["Enums"]["enrollment_status"]
          updated_at: string
          workshop_date: string | null
        }
        Insert: {
          access_status?: Database["public"]["Enums"]["access_status"]
          cancel_date?: string | null
          company_id?: string | null
          completed_at?: string | null
          contact_id: string
          created_at?: string
          created_by: string
          external_ref?: string | null
          funnel_source?: string | null
          golem_campaign?: string | null
          id?: string
          is_test_record?: boolean
          monthly_amount?: number
          next_step?: string | null
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price_tier?: Database["public"]["Enums"]["price_tier"]
          program_run_id?: string | null
          program_type: Database["public"]["Enums"]["program_type"]
          recorded_bootcamp_required?: boolean
          seats?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
          workshop_date?: string | null
        }
        Update: {
          access_status?: Database["public"]["Enums"]["access_status"]
          cancel_date?: string | null
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string
          created_at?: string
          created_by?: string
          external_ref?: string | null
          funnel_source?: string | null
          golem_campaign?: string | null
          id?: string
          is_test_record?: boolean
          monthly_amount?: number
          next_step?: string | null
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price_tier?: Database["public"]["Enums"]["price_tier"]
          program_run_id?: string | null
          program_type?: Database["public"]["Enums"]["program_type"]
          recorded_bootcamp_required?: boolean
          seats?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
          workshop_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_program_run_id_fkey"
            columns: ["program_run_id"]
            isOneToOne: false
            referencedRelation: "program_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_scenarios: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          months: number
          name: string
          rows: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          months?: number
          name: string
          rows?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          months?: number
          name?: string
          rows?: Json
          updated_at?: string
        }
        Relationships: []
      }
      import_batches: {
        Row: {
          campaign: string | null
          created_at: string
          created_by: string
          file_hash: string | null
          file_name: string | null
          id: string
          mapping: Json
          program_run_id: string | null
          rows_created: number
          rows_failed: number
          rows_skipped: number
          rows_total: number
          rows_updated: number
          source: string | null
          status: Database["public"]["Enums"]["import_status"]
          unknown_columns: string[]
          updated_at: string
        }
        Insert: {
          campaign?: string | null
          created_at?: string
          created_by: string
          file_hash?: string | null
          file_name?: string | null
          id?: string
          mapping?: Json
          program_run_id?: string | null
          rows_created?: number
          rows_failed?: number
          rows_skipped?: number
          rows_total?: number
          rows_updated?: number
          source?: string | null
          status?: Database["public"]["Enums"]["import_status"]
          unknown_columns?: string[]
          updated_at?: string
        }
        Update: {
          campaign?: string | null
          created_at?: string
          created_by?: string
          file_hash?: string | null
          file_name?: string | null
          id?: string
          mapping?: Json
          program_run_id?: string | null
          rows_created?: number
          rows_failed?: number
          rows_skipped?: number
          rows_total?: number
          rows_updated?: number
          source?: string | null
          status?: Database["public"]["Enums"]["import_status"]
          unknown_columns?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_program_run_id_fkey"
            columns: ["program_run_id"]
            isOneToOne: false
            referencedRelation: "program_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      import_rows: {
        Row: {
          batch_id: string
          contact_id: string | null
          created_at: string
          enrollment_id: string | null
          error: string | null
          id: string
          idempotency_key: string | null
          normalized_email: string | null
          raw: Json
          result: string
          row_number: number
        }
        Insert: {
          batch_id: string
          contact_id?: string | null
          created_at?: string
          enrollment_id?: string | null
          error?: string | null
          id?: string
          idempotency_key?: string | null
          normalized_email?: string | null
          raw?: Json
          result?: string
          row_number: number
        }
        Update: {
          batch_id?: string
          contact_id?: string | null
          created_at?: string
          enrollment_id?: string | null
          error?: string | null
          id?: string
          idempotency_key?: string | null
          normalized_email?: string | null
          raw?: Json
          result?: string
          row_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_rows_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_rows_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_rows_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_templates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          offset_days: number
          position: number
          program_type: Database["public"]["Enums"]["program_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          offset_days?: number
          position?: number
          program_type: Database["public"]["Enums"]["program_type"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          offset_days?: number
          position?: number
          program_type?: Database["public"]["Enums"]["program_type"]
        }
        Relationships: []
      }
      member_events: {
        Row: {
          contact_id: string
          created_at: string
          created_by: string | null
          description: string | null
          enrollment_id: string | null
          event_type: string
          id: string
          metadata: Json
          occurred_at: string
          title: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          enrollment_id?: string | null
          event_type: string
          id?: string
          metadata?: Json
          occurred_at?: string
          title: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          enrollment_id?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_events_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      ops_issues: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string
          dedupe_key: string | null
          details: string | null
          detected_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          kind: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          dedupe_key?: string | null
          details?: string | null
          detected_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          kind: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          dedupe_key?: string | null
          details?: string | null
          detected_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          kind?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_issues_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ops_issues_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      package_seats: {
        Row: {
          assigned_at: string
          contact_id: string | null
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          package_id: string
          released_at: string | null
          status: Database["public"]["Enums"]["seat_status"]
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          package_id: string
          released_at?: string | null
          status?: Database["public"]["Enums"]["seat_status"]
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          package_id?: string
          released_at?: string | null
          status?: Database["public"]["Enums"]["seat_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_seats_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_seats_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "company_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          pipeline_id: string
          position: number
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          pipeline_id: string
          position?: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          pipeline_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      price_grants: {
        Row: {
          contact_id: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          granted_at: string
          id: string
          is_manual_override: boolean
          monthly_amount: number
          reason: string
          revoked_at: string | null
          revoked_reason: string | null
          source_enrollment_id: string | null
          status: Database["public"]["Enums"]["grant_status"]
          tier: Database["public"]["Enums"]["price_tier"]
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          granted_at?: string
          id?: string
          is_manual_override?: boolean
          monthly_amount?: number
          reason: string
          revoked_at?: string | null
          revoked_reason?: string | null
          source_enrollment_id?: string | null
          status?: Database["public"]["Enums"]["grant_status"]
          tier: Database["public"]["Enums"]["price_tier"]
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          granted_at?: string
          id?: string
          is_manual_override?: boolean
          monthly_amount?: number
          reason?: string
          revoked_at?: string | null
          revoked_reason?: string | null
          source_enrollment_id?: string | null
          status?: Database["public"]["Enums"]["grant_status"]
          tier?: Database["public"]["Enums"]["price_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_grants_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_grants_source_enrollment_id_fkey"
            columns: ["source_enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      program_runs: {
        Row: {
          campaign: string | null
          community_area: string | null
          created_at: string
          created_by: string
          end_date: string | null
          id: string
          lead_trainer: string | null
          max_seats: number | null
          meeting_url: string | null
          name: string
          notes: string | null
          parent_run_id: string | null
          partner: string | null
          recording_url: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["run_status"]
          template_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          campaign?: string | null
          community_area?: string | null
          created_at?: string
          created_by: string
          end_date?: string | null
          id?: string
          lead_trainer?: string | null
          max_seats?: number | null
          meeting_url?: string | null
          name: string
          notes?: string | null
          parent_run_id?: string | null
          partner?: string | null
          recording_url?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["run_status"]
          template_id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          campaign?: string | null
          community_area?: string | null
          created_at?: string
          created_by?: string
          end_date?: string | null
          id?: string
          lead_trainer?: string | null
          max_seats?: number | null
          meeting_url?: string | null
          name?: string
          notes?: string | null
          parent_run_id?: string | null
          partner?: string | null
          recording_url?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["run_status"]
          template_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_runs_parent_run_id_fkey"
            columns: ["parent_run_id"]
            isOneToOne: false
            referencedRelation: "program_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_runs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "program_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      program_sessions: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          materials_url: string | null
          meeting_url: string | null
          position: number
          recording_url: string | null
          run_id: string
          session_type: Database["public"]["Enums"]["session_type"]
          starts_at: string | null
          status: Database["public"]["Enums"]["run_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          materials_url?: string | null
          meeting_url?: string | null
          position?: number
          recording_url?: string | null
          run_id: string
          session_type?: Database["public"]["Enums"]["session_type"]
          starts_at?: string | null
          status?: Database["public"]["Enums"]["run_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          materials_url?: string | null
          meeting_url?: string | null
          position?: number
          recording_url?: string | null
          run_id?: string
          session_type?: Database["public"]["Enums"]["session_type"]
          starts_at?: string | null
          status?: Database["public"]["Enums"]["run_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_sessions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "program_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_templates: {
        Row: {
          active: boolean
          category: Database["public"]["Enums"]["program_category"]
          created_at: string
          created_by: string | null
          default_capacity: number | null
          default_duration_days: number | null
          default_sessions: number
          description: string | null
          id: string
          name: string
          partner: string | null
          prerequisites: string | null
          program_key: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: Database["public"]["Enums"]["program_category"]
          created_at?: string
          created_by?: string | null
          default_capacity?: number | null
          default_duration_days?: number | null
          default_sessions?: number
          description?: string | null
          id?: string
          name: string
          partner?: string | null
          prerequisites?: string | null
          program_key: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: Database["public"]["Enums"]["program_category"]
          created_at?: string
          created_by?: string | null
          default_capacity?: number | null
          default_duration_days?: number | null
          default_sessions?: number
          description?: string | null
          id?: string
          name?: string
          partner?: string | null
          prerequisites?: string | null
          program_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_attendance: {
        Row: {
          contact_id: string
          created_at: string
          enrollment_id: string | null
          id: string
          note: string | null
          recorded_by: string | null
          session_id: string
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          enrollment_id?: string | null
          id?: string
          note?: string | null
          recorded_by?: string | null
          session_id: string
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          enrollment_id?: string | null
          id?: string
          note?: string | null
          recorded_by?: string | null
          session_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_attendance_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_attendance_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "program_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_interval: string
          cancel_reason: string | null
          cancel_requested_at: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string
          currency: string
          end_date: string | null
          enrollment_id: string | null
          id: string
          monthly_amount: number
          notes: string | null
          package_id: string | null
          price_tier: Database["public"]["Enums"]["price_tier"]
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          tax_included: boolean
          tax_rate: number
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          cancel_reason?: string | null
          cancel_requested_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by: string
          currency?: string
          end_date?: string | null
          enrollment_id?: string | null
          id?: string
          monthly_amount?: number
          notes?: string | null
          package_id?: string | null
          price_tier?: Database["public"]["Enums"]["price_tier"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          tax_included?: boolean
          tax_rate?: number
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          cancel_reason?: string | null
          cancel_requested_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          end_date?: string | null
          enrollment_id?: string | null
          id?: string
          monthly_amount?: number
          notes?: string | null
          package_id?: string | null
          price_tier?: Database["public"]["Enums"]["price_tier"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          tax_included?: boolean
          tax_rate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "company_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed: boolean
          contact_id: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_contact: { Args: { _contact_id: string }; Returns: boolean }
      can_view_record: { Args: { _owner: string }; Returns: boolean }
      detect_ops_issues: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_team_member: {
        Args: { _target_user_id: string; _user_id: string }
        Returns: boolean
      }
      price_for_tier: {
        Args: { _tier: Database["public"]["Enums"]["price_tier"] }
        Returns: number
      }
      seed_default_pipeline: { Args: { p_user_id: string }; Returns: string }
    }
    Enums: {
      access_state:
        | "not_required"
        | "pending"
        | "granted"
        | "sync_error"
        | "suspended"
        | "revoked"
      access_status: "none" | "pending" | "granted" | "revoked"
      activity_type: "call" | "email" | "meeting" | "note"
      app_role: "admin" | "manager" | "rep"
      attendance_status:
        | "registered"
        | "attended"
        | "partial"
        | "no_show"
        | "excused"
      enrollment_status:
        | "interested"
        | "registered"
        | "attended"
        | "no_show"
        | "completed"
        | "active"
        | "paused"
        | "cancelled"
      grant_status: "active" | "expired" | "revoked"
      import_status: "pending" | "previewed" | "completed" | "failed"
      issue_status: "open" | "acknowledged" | "resolved" | "ignored"
      payment_status: "none" | "pending" | "paid" | "refunded" | "failed"
      price_tier:
        | "none"
        | "foundation_490"
        | "early_590"
        | "standard_690"
        | "company_1_690"
        | "company_2_990"
        | "company_5_1900"
        | "workshop_standalone_2300"
      program_category:
        | "free_workshop"
        | "bootcamp"
        | "cohort"
        | "corporate_workshop"
        | "consulting"
      program_type: "free_workshop" | "bootcamp" | "cohort" | "company"
      run_status:
        | "draft"
        | "published"
        | "registration_open"
        | "running"
        | "completed"
        | "cancelled"
      seat_status: "assigned" | "invited" | "active" | "released"
      session_type: "live" | "catch_up" | "onboarding" | "recorded" | "other"
      subscription_status:
        | "waitlist"
        | "invited"
        | "payment_pending"
        | "onboarding_required"
        | "onboarding_active"
        | "active"
        | "past_due"
        | "cancellation_scheduled"
        | "cancelled"
        | "alumni"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_state: [
        "not_required",
        "pending",
        "granted",
        "sync_error",
        "suspended",
        "revoked",
      ],
      access_status: ["none", "pending", "granted", "revoked"],
      activity_type: ["call", "email", "meeting", "note"],
      app_role: ["admin", "manager", "rep"],
      attendance_status: [
        "registered",
        "attended",
        "partial",
        "no_show",
        "excused",
      ],
      enrollment_status: [
        "interested",
        "registered",
        "attended",
        "no_show",
        "completed",
        "active",
        "paused",
        "cancelled",
      ],
      grant_status: ["active", "expired", "revoked"],
      import_status: ["pending", "previewed", "completed", "failed"],
      issue_status: ["open", "acknowledged", "resolved", "ignored"],
      payment_status: ["none", "pending", "paid", "refunded", "failed"],
      price_tier: [
        "none",
        "foundation_490",
        "early_590",
        "standard_690",
        "company_1_690",
        "company_2_990",
        "company_5_1900",
        "workshop_standalone_2300",
      ],
      program_category: [
        "free_workshop",
        "bootcamp",
        "cohort",
        "corporate_workshop",
        "consulting",
      ],
      program_type: ["free_workshop", "bootcamp", "cohort", "company"],
      run_status: [
        "draft",
        "published",
        "registration_open",
        "running",
        "completed",
        "cancelled",
      ],
      seat_status: ["assigned", "invited", "active", "released"],
      session_type: ["live", "catch_up", "onboarding", "recorded", "other"],
      subscription_status: [
        "waitlist",
        "invited",
        "payment_pending",
        "onboarding_required",
        "onboarding_active",
        "active",
        "past_due",
        "cancellation_scheduled",
        "cancelled",
        "alumni",
      ],
    },
  },
} as const
