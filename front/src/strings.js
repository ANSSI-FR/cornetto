/*
 Cornetto

 Copyright (C) 2018–2019 ANSSI
 Contributors:
 2018–2019 Paul Fayoux paul.fayoux@ssi.gouv.fr
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 */
export default {
  fr: {
    steps: {
      step1: 'Il est conseillé de vérifier le résultat de la statification en prévisualisant \n cette nouvelle version du site dans votre navigateur web.',
      step2: 'Si le résultat est satisfaisant, vous pouvez enregistrer cette version du site. Attention l\'enregistrement peut prendre un peu de temps',
      step3: 'Vous pouvez mettre en ligne cette version maintenant, ou le faire plus tard. Attention la publication peut mettre un peu de temps.'
    },
    errors: {
      text: {
        timeout: 'Le serveur n\'a pas pu être contacté. Si l\'erreur persiste contacter un administrateur.',
        unknown: 'Veuillez réessayer. Contactez un administrateur si le problème persiste.',
        system_fail: 'Une erreur est survenue lors du traitement côté serveur. Veuillez contacter un administrateur.',
        subprocess: 'Une erreur a eu lieu lors du traitement côté serveur. Veuillez contacter un administrateur.',
        process_running: 'Un processus de statification est en cours, cette opération est interdite. Veuillez raffraichir la page si vous ne voyez pas la bar de progression, si le problème persiste veuillez contacter un administrateur.',
        database: 'Un problème est survenue lorsque le système a tenté de retrouver la statification dans la base de donnée. Veuillez contacter un administrateur.',
        commit_nothing: 'Rien n\'est a enregistrer. La dernière statification est déjà sauvergardée. Si cette erreur persiste, veuillez contacter un administrateur.',
        commit_unvalid: 'L\'identifiant de commit de la statification n\'est pas correct. Cette erreur nécéssite l\'intervention d\'un administrateur.',
        commit: 'Une erreur est survenue pendant l\'enregistrement de la statification. Veuillez contacter un administrateur.',
        visualize: 'Une erreur est survenue lors de la publication pour la prévisualisation. Veuillez contacter un administrateur.',
        forwarded_user_empty: 'L\'entête HTTP X-Forwarded-User n\'est pas renseigné. Veuillez contacter un administrateur.',
        route_access: 'Un autre processus est en cours, vous ne pouvez pas réaliser cette action en parallèle, veuillez-attendre.'
      },
      validation: {
        empty: 'Ce champ ne peut être vide',
        tooShort: 'Ce champ doit contenir au moins 4 caractères',
        tooLong: 'Ce champ doit contenir au plus 50 caractères',
        regex: 'Ce champ peut contenir uniquement les caractères spéciaux suivants: espace - _'
      }
    },
    infos: {
      text: {
        commit: 'Enregistrement réussi.',
        pushtoprod: 'Publication réussi.',
        visualize: 'Prévisualisation chargée.',
        start_commit: 'Démarrage de l\'enregistrement.',
        start_pushtoprod: 'Chargement de la publication.',
        start_visualize: 'Chargement de la prévisualisation.'
      }
    },
    ui: {
      buttons: {
        submit: 'Démarrer',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        ok: 'OK',
        visualize: 'Prévisualiser',
        publish: 'Publier',
        show_all: 'Montrer tout',
        show_ten_last: '10 dernières modifications',
        export: 'Exporter'
      },
      tabs: {
        new: 'création',
        edit: 'édition',
        empty: 'vide',
        create: 'Statification',
        list: 'Liste',
        warning_change_tab: 'Attention, le changement d\'onglet nécéssite l\'arrêt du processus de statification.'
      },
      steps: {
        create: 'Créer',
        preview: 'Prévisualiser',
        save: 'Enregistrer',
        publish: 'Publier',
        cancel: 'Annuler',
        new: 'Nouvelle statification'
      },
      footer: {
        cda: 'Contactez le CDA au 8900 en cas d\'erreur bloquante.'
      }
    },
    search: {
      no_result: 'Aucun resultat n\'est disponible.'
    },
    statification: {
      dialog: {
        change_tab: {
          title: 'Avertissement',
          text: 'Si vous quittez cet onglet sans enregistrer la statification en cours, celle-ci sera supprimée.'
        },
        cancel_step: {
          title: 'Voulez-vous abandonner la statification en cours ?',
          text: 'Si vous abandonnez la statification en cours sera supprimée. Vous pourrez créer à nouveau une nouvelle statification.'
        },
        redirect_process_running: {
          title: 'Un utilisateur vient de créer une nouvelle statification.',
          text: 'Vous aller être redirigé vers l\'étape en cours de la nouvelle statification.'
        }
      },
      title: 'Statification',
      reference: {
        label: 'Référence',
        help: 'format : [A-F][0-9]{1,3}-[0-9]+'
      },
      designation: {
        label: 'Désignation',
        help: 'Ce champ correspond à un titre court, il ne doit pas dépasser 50 caractères et contenir seulement les caractères spéciaux suivants: espace - _'
      },
      description: {
        label: 'Commentaire (optionnel)'
      },
      cre_date: {
        label: 'Date de Création'
      },
      upd_date: {
        label: 'Date de mise à jour'
      },
      statut: {
        label: 'Statut',
        commit: '',
        prod: 'prod',
        visualize: 'visu'
      },
      errors_scrapy: {
        title: 'Erreurs Scrapy',
        error_code: 'Code d\'erreur'
      },
      errors_html: {
        title: 'Erreurs HTML',
        error_code: 'Code d\'erreur',
        source: 'Source',
        url: 'Url',
        no_errors: 'Aucune erreur HTML'
      },
      errors_type_mime: {
        title: 'Fichiers exclus (type MIME non valide)',
        type_mime: 'Type MIME',
        url: 'Url',
        no_errors: 'Aucun fichier exclus'
      },
      scanned_files: {
        title: 'Fichiers scannés',
        nb: 'Nb',
        type_file: 'Extension des fichiers'
      },
      external_links: {
        title: 'Liens externes',
        source: 'Source',
        url: 'Url'
      },
      historic: {
        title: 'Historique',
        action: 'Action(s) réalisée(s)',
        date: 'Date',
        user: 'Utilisateur'
      }
    },
    export_csv: {
      button: 'Export',
      empty_csv: '"aucun(e)"',
      errors_scrapy: '"Erreurs Scrapy"',
      errors_html: '"Erreurs HTML"',
      errors_type_mime: '"Type Mime"',
      scanned_files: '"Fichiers Scannes"',
      external_links: '"Liens Externes"',
      historic: '"Historique"'
    },
    url: {
      site_static: 'https://static.web.your-private-domain.com',
      site_visualize: 'https://visualize.web.your-private-domain.com',
      site_prod: 'http://web.com',
      name: 'web.com'
    }
  }
}
