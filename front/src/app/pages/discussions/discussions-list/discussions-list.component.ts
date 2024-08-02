import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Discussion } from 'src/app/core/interfaces/discussions.interface';
import { User } from 'src/app/core/interfaces/user.interface';
import { DiscussionsService } from 'src/app/core/services/discussions.service';
import { SessionService } from 'src/app/core/services/session.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-discussions-list',
  templateUrl: './discussions-list.component.html',
  styleUrls: ['./discussions-list.component.scss']
})
export class DiscussionsListComponent implements OnInit, OnDestroy {
  public discussions$: Observable<Discussion[]> | undefined;
  public user: User | undefined; 
  private subscriptions: Subscription = new Subscription();

  constructor(
    private discussionsService: DiscussionsService,
    private sessionService: SessionService, 
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initializeUserAndLoadDiscussions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeUserAndLoadDiscussions(): void {
    const session = this.sessionService.getSession();

    if (!session) {
      console.warn('Aucune session utilisateur trouvée');
      return;
    }

    const userSub = this.userService.getUserById(session.id).subscribe(
      (user) => {
        this.user = user;
        this.loadDiscussionsBasedOnUserRole(user);
      },
      (error) => {
        console.error('Erreur lors de la récupération des détails de l\'utilisateur:', error);
      }
    );

    this.subscriptions.add(userSub);
  }

  private loadDiscussionsBasedOnUserRole(user: User): void {
    this.discussions$ = user.admin
      ? this.discussionsService.getAllDiscussions()
      : this.discussionsService.getDiscussionsByUserId(user.id);
  }

  public getStatusClass(status: string): string {
    switch (status) {
      case 'New':
        return 'status-new';
      case 'In Progress':
        return 'status-in-progress';
      case 'Closed':
        return 'status-closed';
      default:
        return '';
    }
  }

  public changeStatus(event: MouseEvent, discussion: Discussion, action: string): void {
    event.stopPropagation(); 

    let newStatus: string;
    switch (action) {
      case 'NEW':
        newStatus = 'New';
        break;
      case 'IN PROGRESS':
        newStatus = 'In Progress';
        break;
      case 'CLOSE':
        newStatus = 'Closed';
        break;
      default:
        console.log('Unknown action');
        return;
    }

    const discussionSub = this.discussionsService.updateDiscussionStatusById(discussion.id, { ...discussion, status: newStatus }).subscribe(
      (updatedDiscussion) => {
        console.log('Discussion updated successfully:', updatedDiscussion);
        this.loadDiscussionsBasedOnUserRole(this.user!);
      },
      (error) => {
        console.error('Error updating discussion status:', error);
      }
    );

    this.subscriptions.add(discussionSub);
  }
}
